"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { CiWarning } from "react-icons/ci";

import CarouselComp from "./CarouselComp";
import { toast } from "sonner";

export default function DialogComp({ selectedApplicants, onShortlistUpdate }) {
  const [shortlistStatus, setShortlistStatus] = useState([]);
  const [displayApplicants, setDisplayApplicants] = useState(selectedApplicants);

  useEffect(() => {
    // Only update when there is a new non‑empty selection
    if (selectedApplicants && selectedApplicants.length > 0) {
      setDisplayApplicants(selectedApplicants);
      const status = selectedApplicants.map(applicant => applicant.shortlisted);
      setShortlistStatus(status);
    }
  }, [selectedApplicants]);

  const handleShortlist = async (index) => {
    const applicant = displayApplicants[index];
    if (!applicant) return; // safety guard
    const isShortlisted = shortlistStatus[index];

    try {
      const res = await fetch(`/api/shortlist/${applicant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: !isShortlisted }),
      });

      if (res.ok) {
        const updatedStatus = [...shortlistStatus];
        updatedStatus[index] = !isShortlisted;
        setShortlistStatus(updatedStatus);
        if (onShortlistUpdate) {
          onShortlistUpdate(applicant._id, !isShortlisted);
        }
        toast.success(`Applicant has been ${!isShortlisted ? 'shortlisted' : 'unshortlisted'}!`);
      } else {
        console.error("Failed to update applicant status.");
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Error occurred while updating the status:", error.message);
      toast.error("Failed to update status");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Responses</Button>
      </DialogTrigger>
      <DialogContent className="response-dialog">
        <DialogHeader>
          <DialogTitle>Applicant&apos;s Responses</DialogTitle>
          <DialogDescription>
            Questions and answers answered by the applicants can be viewed here.
          </DialogDescription>
        </DialogHeader>
        <div className="response-dialog-body">
          {displayApplicants && displayApplicants.length !== 0 ? (
            <CarouselComp
              dataList={displayApplicants}
              handleShortlist={handleShortlist}
              shortlistStatus={shortlistStatus}
            />
          ) : (
            <DialogDescription className="text-center text-muted-foreground response-empty-state">
              No applicant selected
            </DialogDescription>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
