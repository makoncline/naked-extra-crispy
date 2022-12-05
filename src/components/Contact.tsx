import React from "react";
import { useForm } from "react-hook-form";
import { siteConfig } from "../siteConfig";
import { Error } from "../styles/text";
import { Space } from "./Space";
import router from "next/router";
import { Loading } from "./Loading";

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
    <details>
      <summary> Have feedback? Send me a message</summary>
      <div>
        <Space size="sm" />
        <p>
          I'm always looking to improve the site. If you have any feedback,
          please let me know!
        </p>
        <Space size="sm" />
        <form onSubmit={handleSubmit(onSubmit)}>
          {!userEmail ? (
            <div>
              <label htmlFor="email-input">Email:</label>
              <input {...register("email", { required: true })} type="email" />
              {errors.email && <Error>This field is required</Error>}
            </div>
          ) : null}
          <div>
            <label htmlFor="message-input">Message:</label>
            <textarea {...register("message", { required: true })} />
            {errors.message && <Error>This field is required</Error>}
          </div>
          <button type="submit">
            {submitting ? <Loading scale={0.3} /> : "Send Email"}
          </button>
          {Object.keys(errors).length > 0 &&
            Object.entries(errors).map(([key, error]) => (
              <div key={key}>
                <Error>{error.message}</Error>
              </div>
            ))}
        </form>
      </div>
    </details>
  );
};
