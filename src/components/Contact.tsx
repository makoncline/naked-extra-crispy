import React from "react";
import { useForm } from "react-hook-form";
import { siteConfig } from "../siteConfig";
import router from "next/router";
import { Loading } from "./Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Contact = ({ userEmail }: { userEmail: string | undefined }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: userEmail || "", message: "" } });

  const onSubmit = async (data: { email: string; message: string }) => {
    setSubmitting(true);
    const { email, message } = data;
    const queryParams = new URLSearchParams();
    queryParams.set("subject", `${siteConfig.title} Feedback`);
    queryParams.set("email", email);
    queryParams.set("message", message);

    await fetch(`${siteConfig.sendEmailUrl}?${queryParams}`).catch(() => {
      // ignore error for now
    });
    setSubmitting(false);
    router.push("/thanks");
  };

  return (
    <details className="rounded-lg border bg-card p-4">
      <summary className="cursor-pointer font-medium">
        Have feedback? Send me a message
      </summary>
      <div className="mt-4 grid gap-4">
        <p className="text-sm text-muted-foreground">
          I&apos;m always looking to improve the site. If you have any feedback,
          please let me know!
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {!userEmail ? (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email", { required: true })}
                type="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">This field is required</p>
              )}
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...register("message", { required: true })}
            />
            {errors.message && (
              <p className="text-sm text-destructive">This field is required</p>
            )}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loading scale={0.3} /> : "Send Email"}
          </Button>
          {Object.keys(errors).length > 0 &&
            Object.entries(errors).map(([key, error]) => (
              <div key={key}>
                <p className="text-sm text-destructive">{error.message}</p>
              </div>
            ))}
        </form>
      </div>
    </details>
  );
};
