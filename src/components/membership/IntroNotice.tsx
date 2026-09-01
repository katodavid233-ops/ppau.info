import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

type Props = {
  title?: string;
  html?: string | null;
};

export function IntroNotice({ title = "Before you apply", html }: Props) {
  return (
    <Alert className="mb-8 border-primary/20 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-sm space-y-2 mt-2">
        {html ? (
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <>
            <p>Welcome to the official PPAU membership registration platform.</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Pay the prescribed membership fee (UGX 50,000/year for professionals) or pay online in the final step.</li>
              <li>Keep proof of payment if paying manually.</li>
              <li>Complete this form accurately and upload all required documents.</li>
            </ol>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
