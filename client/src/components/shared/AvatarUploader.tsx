import { Camera, Trash2 } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDeleteAvatar, useUploadAvatar } from "@/features/profile/hooks/useProfile"

interface AvatarUploaderProps {
  avatarUrl: string | null
  username: string
  onAvatarChange?: () => void
}

export function AvatarUploader({ avatarUrl, username, onAvatarChange }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadMutation = useUploadAvatar(setProgress)
  const deleteMutation = useDeleteAvatar()

  const initials = username.slice(0, 2).toUpperCase()
  const displayUrl = preview || avatarUrl

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setProgress(0)
    setPreview(URL.createObjectURL(file))
    uploadMutation.mutate(file, {
      onSettled: () => {
        setPreview(null)
        setProgress(0)
        onAvatarChange?.()
      },
    })
  }

  function handleDelete() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowConfirmDelete(false)
        onAvatarChange?.()
      },
    })
  }

  const isMutating = uploadMutation.isPending || deleteMutation.isPending

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-32 overflow-hidden rounded-full border-2 border-border">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={username}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-3xl font-bold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isMutating}
      />

      {uploadMutation.isPending && progress > 0 && progress < 100 && (
        <div className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isMutating}
        >
          <Camera className="mr-1 size-4" />
          {uploadMutation.isPending ? "Uploading..." : "Upload"}
        </Button>

        {avatarUrl && !showConfirmDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmDelete(true)}
            disabled={isMutating}
          >
            <Trash2 className="mr-1 size-4" />
            Remove
          </Button>
        )}

        {showConfirmDelete && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {uploadMutation.isError && (
        <p className="text-sm text-destructive">
          {uploadMutation.error instanceof Error
            ? uploadMutation.error.message
            : "Failed to upload avatar"}
        </p>
      )}

      {deleteMutation.isError && (
        <p className="text-sm text-destructive">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Failed to remove avatar"}
        </p>
      )}
    </div>
  )
}
