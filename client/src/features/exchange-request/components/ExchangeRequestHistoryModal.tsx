import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

import type { ExchangeRequest } from "../types/exchange-request"
import {
  formatRequestDateTime,
  getDisplayName,
  getInitials,
  getSkillDisplayName,
} from "../utils"

interface ExchangeRequestHistoryModalProps {
  request: ExchangeRequest | null
  onClose: () => void
}

function skillLabel(
  skill: ExchangeRequest["learning_skill"],
): string | null {
  return skill ? getSkillDisplayName(skill) : null
}

export function ExchangeRequestHistoryModal({
  request,
  onClose,
}: ExchangeRequestHistoryModalProps) {
  const history = request?.history ?? []

  return (
    <Dialog
      open={request !== null}
      onClose={onClose}
      title="Request History"
    >
      <div className="space-y-4">
        <p className="rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Only edits made after the request was accepted are recorded.
        </p>

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No edit history for this request.
          </p>
        ) : (
          <ol className="relative space-y-6 border-l pl-5">
            {[...history].reverse().map((entry) => {
              const prevLearning = skillLabel(entry.learning_skill)
              const prevTeaching = skillLabel(entry.teaching_skill)
              return (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[27px] top-1.5 size-2.5 rounded-full bg-primary"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {entry.edited_by?.profile?.avatar_url ? (
                          <img
                            src={entry.edited_by.profile.avatar_url}
                            alt=""
                            className="size-7 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary">
                            {entry.edited_by
                              ? getInitials(
                                  entry.edited_by.first_name,
                                  entry.edited_by.last_name,
                                )
                              : "?"}
                          </span>
                        )}
                        <span className="truncate text-sm font-medium">
                          {entry.edited_by
                            ? getDisplayName(entry.edited_by)
                            : "Unknown"}{" "}
                          edited the request
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRequestDateTime(entry.created_at)}
                      </span>
                    </div>

                    <div className="space-y-0.5 pl-9 text-xs text-muted-foreground">
                      <p>
                        Learning before:{" "}
                        <span className="font-medium text-foreground">
                          {prevLearning ?? "None"}
                        </span>
                      </p>
                      <p>
                        Teaching before:{" "}
                        <span className="font-medium text-foreground">
                          {prevTeaching ?? "None"}
                        </span>
                      </p>
                      {entry.message !== null && (
                        <p>
                          Note before:{" "}
                          <span className="font-medium text-foreground">
                            {entry.message}
                          </span>
                        </p>
                      )}
                    </div>

                    <p className="text-xs italic text-muted-foreground">
                      Request reopened (pending) for re-confirmation.
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}