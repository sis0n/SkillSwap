<?php

declare(strict_types=1);

?>

<x-mail::message>
# Verify Your Email Address

Thank you for creating a SkillSwap account. Use the following verification code to complete your registration:

<x-mail::panel>
<h1 style="text-align: center; font-size: 32px; letter-spacing: 8px;">{{ $code }}</h1>
</x-mail::panel>

This code will expire in 10 minutes.

If you did not create an account, no further action is required.

Thanks,<br>
{{ config('app.name') }}
</x-mail::mail>
