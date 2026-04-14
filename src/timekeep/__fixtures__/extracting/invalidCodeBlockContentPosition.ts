import { createCodeBlock } from "@/utils/codeblock";

// Input data to find
export const input1 = createCodeBlock(`{"invalid_json}]}`, 4, 4);

export const text = "\n\n\n" + input1 + "\n\n\n\n";
