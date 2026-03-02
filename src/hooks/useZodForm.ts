import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  UseFormProps,
  type FieldValues,
} from "react-hook-form";
import { z } from "zod";

export function useZodForm<TFieldValues extends FieldValues>(
  props: Omit<UseFormProps<TFieldValues>, "resolver"> & {
    schema: z.ZodTypeAny;
  }
) {
  const { schema, ...formProps } = props;
  const form = useForm<TFieldValues>({
    ...formProps,
    resolver: zodResolver(schema as never) as never,
  });

  return form;
}
