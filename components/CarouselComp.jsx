"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import { Separator } from "./ui/separator";
import { Button } from "@/components/ui/button";

export default function CarouselComp({
    dataList,
    handleShortlist,
    shortlistStatus,
}) {
    const getQuestions = (data) => {
        if (!data?.Questions) return [];

        if (Array.isArray(data.Questions)) {
            return data.Questions;
        }

        if (typeof data.Questions === "object") {
            return Object.entries(data.Questions);
        }

        return [];
    };

    return (
        <Carousel className="response-carousel">
            <CarouselContent>
                {dataList.map((data, index) => {
                    const questions = getQuestions(data);

                    return (
                        <CarouselItem key={data._id || data.id || index}>
                            <div className="response-slide">
                                <Card className="response-card">
                                    <CardContent className="response-card-content">
                                        <div className="response-applicant">
                                            <span className="response-applicant-name">{data.Name || "Unnamed Applicant"}</span>
                                            <span className="response-applicant-department">
                                                {data.Department || "No Department"}
                                            </span>
                                            <div className="response-applicant-details">
                                                <span>Gender: {data.Gender || "Not provided"}</span>
                                                <span>Why they want to join: {data["Why do you want to join the department?"] || "Not provided"}</span>
                                            </div>
                                        </div>
                                        <div className="response-answer-list">
                                            {questions.length > 0 ? (
                                                questions.map(([question, answer], qIndex) => {
                                                    const displayAnswer =
                                                        answer === undefined || answer === null || answer === ""
                                                            ? "Not Answered"
                                                            : answer;

                                                    return (
                                                        <div
                                                            key={`${question}-${qIndex}`}
                                                            className="response-answer"
                                                        >
                                                            <h3>
                                                                {qIndex + 1}. {question}{" "}
                                                            </h3>
                                                            <Separator />
                                                            <p>
                                                                {displayAnswer}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="response-no-answer">
                                                    No responses available for this applicant.
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleShortlist(index)}
                                            className={`response-shortlist-button ${
                                                shortlistStatus[index]
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-green-600 hover:bg-green-700"
                                            }`}
                                        >
                                            {shortlistStatus[index]
                                                ? "Unshortlist Applicant"
                                                : "Shortlist Applicant"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
