
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ToneStyleSelectorProps {
  selectedTone: string;
  selectedStyle: string;
  onToneChange: (tone: string) => void;
  onStyleChange: (style: string) => void;
}

const toneOptions = [
  { value: "formal", label: "Formal", description: "Professional and academic tone" },
  { value: "conversational", label: "Conversational", description: "Natural and engaging tone" },
  { value: "confident", label: "Confident", description: "Assertive and self-assured tone" },
  { value: "humble", label: "Humble", description: "Modest and respectful tone" },
  { value: "persuasive", label: "Persuasive", description: "Compelling and convincing tone" }
];

const styleOptions = [
  { value: "detailed", label: "Detailed Analysis", description: "Comprehensive feedback with examples" },
  { value: "concise", label: "Concise Review", description: "Brief, focused improvement points" },
  { value: "developmental", label: "Developmental", description: "Growth-focused suggestions" },
  { value: "competitive", label: "Competitive Edge", description: "Stand-out strategies for applications" }
];

const ToneStyleSelector = ({
  selectedTone,
  selectedStyle,
  onToneChange,
  onStyleChange
}: ToneStyleSelectorProps) => {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-accent/10">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Feedback Tone</Label>
        <RadioGroup value={selectedTone} onValueChange={onToneChange}>
          {toneOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={option.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Feedback Style</Label>
        <Select value={selectedStyle} onValueChange={onStyleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select feedback style" />
          </SelectTrigger>
          <SelectContent>
            {styleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ToneStyleSelector;
