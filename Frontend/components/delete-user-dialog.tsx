'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { Address } from 'viem'

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  userAddress: Address
  userName: string
  onDeleteUser: (userAddress: Address) => Promise<void>
  isDeleting: boolean
  isSelfDelete?: boolean
}

export function DeleteUserDialog({ 
  isOpen, 
  onClose, 
  userAddress, 
  userName, 
  onDeleteUser, 
  isDeleting,
  isSelfDelete = false 
}: DeleteUserDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const requiredText = isSelfDelete ? 'DELETE MY ACCOUNT' : 'DELETE USER'

  const handleDelete = async () => {
    if (confirmText !== requiredText) return
    
    try {
      await onDeleteUser(userAddress)
      onClose()
      setConfirmText('')
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {isSelfDelete ? 'Delete Your Account' : 'Delete User'}
          </DialogTitle>
          <DialogDescription>
            {isSelfDelete 
              ? 'This will permanently delete your account and remove all your data from the chat system.'
              : `This will permanently delete ${userName}'s account and remove all their data from the chat system.`
            }
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Warning:</strong> This action cannot be undone. All messages, group memberships, and profile data will be permanently removed.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Type <code className="bg-muted px-1 py-0.5 rounded text-xs">{requiredText}</code> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={requiredText}
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={confirmText !== requiredText || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {isSelfDelete ? 'Delete My Account' : 'Delete User'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
