<?php

declare(strict_types=1);

namespace App\Services\Profile;

use App\Models\Language;
use App\Models\PortfolioLink;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserAvailability;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileService
{
    public function updateProfile(User $user, array $data): Profile
    {
        return DB::transaction(function () use ($user, $data) {
            $profile = $user->profile()->firstOrCreate(
                ['user_id' => $user->id],
            );

            $fillable = array_intersect_key($data, array_flip([
                'headline', 'bio', 'location', 'website', 'experience_level', 'timezone',
            ]));

            if (!empty($fillable)) {
                $profile->update($fillable);
            }

            if (array_key_exists('languages', $data)) {
                $this->syncLanguages($user, $data['languages']);
            }

            if (array_key_exists('portfolio_links', $data)) {
                $this->syncPortfolioLinks($user, $data['portfolio_links']);
            }

            return $profile->fresh();
        });
    }

    private function syncLanguages(User $user, array $languages): void
    {
        $syncData = [];

        foreach ($languages as $lang) {
            $language = Language::where('code', $lang['code'])->first();

            if (!$language) {
                continue;
            }

            $syncData[$language->id] = ['proficiency' => $lang['proficiency']];
        }

        $user->languages()->sync($syncData);
    }

    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        return DB::transaction(function () use ($user, $file) {
            $profile = $user->profile()->firstOrCreate(
                ['user_id' => $user->id],
            );

            if ($profile->avatar) {
                Storage::disk('public')->delete($profile->avatar);
            }

            $path = 'avatars/' . Str::random(40) . '.png';

            $gd = @imagecreatefromstring(file_get_contents($file->path()));
            if ($gd === false) {
                throw new \RuntimeException('Failed to decode uploaded image.');
            }

            $gd = $this->cropToSquare($gd, 400);

            imagepng($gd, Storage::disk('public')->path($path));
            imagedestroy($gd);

            $profile->update(['avatar' => $path]);

            return $path;
        });
    }

    public function uploadAvatarFromUrl(User $user, string $url, bool $force = false): void
    {
        $profile = $user->profile()->firstOrCreate(
            ['user_id' => $user->id],
        );

        if ($profile->avatar && !$force) {
            return;
        }

        if ($force && $profile->avatar) {
            Storage::disk('public')->delete($profile->avatar);
            $profile->update(['avatar' => null]);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::get($url);
            if ($response->failed()) {
                return;
            }

            $gd = @imagecreatefromstring($response->body());
            if ($gd === false) {
                Log::warning('Failed to decode OAuth avatar', ['url' => $url]);
                return;
            }

            $gd = $this->cropToSquare($gd, 400);

            $path = 'avatars/' . Str::random(40) . '.png';
            imagepng($gd, Storage::disk('public')->path($path));
            imagedestroy($gd);

            $profile->update(['avatar' => $path]);
        } catch (\Throwable $e) {
            Log::warning('Failed to download OAuth avatar', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function cropToSquare(\GdImage $gd, int $size): \GdImage
    {
        $width = imagesx($gd);
        $height = imagesy($gd);
        $min = min($width, $height);
        $srcX = (int)(($width - $min) / 2);
        $srcY = (int)(($height - $min) / 2);

        $square = imagecreatetruecolor($size, $size);
        imagesavealpha($square, true);
        $transparent = imagecolorallocatealpha($square, 0, 0, 0, 127);
        imagefill($square, 0, 0, $transparent);

        imagecopyresampled($square, $gd, 0, 0, $srcX, $srcY, $size, $size, $min, $min);
        imagedestroy($gd);

        return $square;
    }

    public function syncAvatarFromSocial(User $user): void
    {
        $profile = $user->profile;

        if (!$profile || $profile->avatar) {
            return;
        }

        $socialAccount = $user->socialAccounts()
            ->whereNotNull('avatar_url')
            ->first();

        if (!$socialAccount || !$socialAccount->avatar_url) {
            return;
        }

        $this->uploadAvatarFromUrl($user, $socialAccount->avatar_url);
    }

    public function deleteAvatar(User $user): void
    {
        $profile = $user->profile;

        if (!$profile || !$profile->avatar) {
            return;
        }

        Storage::disk('public')->delete($profile->avatar);

        $profile->update(['avatar' => null]);
    }

    private function syncPortfolioLinks(User $user, array $links): void
    {
        PortfolioLink::where('user_id', $user->id)->delete();

        foreach ($links as $index => $link) {
            PortfolioLink::create([
                'user_id' => $user->id,
                'platform' => $link['platform'],
                'url' => $link['url'],
                'display_order' => $index,
            ]);
        }
    }

    public function getAvailability(User $user): Collection
    {
        return $user->availability()->orderBy('day_of_week')->orderBy('start_time')->get();
    }

    public function updateAvailability(User $user, ?array $slots): Collection
    {
        return DB::transaction(function () use ($user, $slots) {
            $user->availability()->delete();

            if (!empty($slots)) {
                $data = array_map(function (array $slot) use ($user) {
                    return [
                        'user_id' => $user->id,
                        'day_of_week' => $slot['day_of_week'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $slots);

                UserAvailability::insert($data);
            }

            return $this->getAvailability($user);
        });
    }
}
