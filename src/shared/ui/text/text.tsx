import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@shared/lib/cn";

const VARIANT_CLASSES = {
  title: "text-2xl font-bold text-foreground text-right",
  heading: "text-lg font-semibold text-foreground text-right",
  body: "text-base text-foreground text-right",
  caption: "text-sm text-muted-foreground text-right",
  label: "text-sm font-medium text-foreground text-right",
} as const;

export type TextVariant = keyof typeof VARIANT_CLASSES;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

export function Text({ variant = "body", className, ...props }: TextProps) {
  return (
    <RNText
      className={cn(VARIANT_CLASSES[variant], className)}
      style={{ fontFamily: "Cairo" }}
      {...props}
    />
  );
}
