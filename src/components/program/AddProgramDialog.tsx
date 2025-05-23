
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagSelector from "../tags/TagSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddProgramDialog = ({ open, onOpenChange }: AddProgramDialogProps) => {
  const { addProgram } = useProgramContext();
  const { tags } = useTagContext();
  const isMobile = useIsMobile();
  const statusTags = tags.filter((tag) => tag.type === "status");
  const customTags = tags.filter((tag) => tag.type === "custom");

  const [formData, setFormData] = useState({
    programName: "",
    university: "",
    degreeType: "Masters",
    country: "",
    tuition: "",
    deadline: "",
    notes: "",
    statusTagId: "status-considering", // Default status
    customTagIds: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgram(formData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      programName: "",
      university: "",
      degreeType: "Masters",
      country: "",
      tuition: "",
      deadline: "",
      notes: "",
      statusTagId: "status-considering",
      customTagIds: [],
    });
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="programName">Program Name *</Label>
          <Input
            id="programName"
            name="programName"
            value={formData.programName}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="university">University *</Label>
          <Input
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="e.g. Stanford University"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="degreeType">Degree Type *</Label>
          <Select
            value={formData.degreeType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, degreeType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select degree type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Associate">Associate</SelectItem>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Masters">Masters</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. USA"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition">Tuition</Label>
          <Input
            id="tuition"
            name="tuition"
            value={formData.tuition}
            onChange={handleChange}
            placeholder="e.g. $30,000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Application Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this program..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.statusTagId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, statusTagId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagSelector
            availableTags={customTags}
            selectedTagIds={formData.customTagIds}
            onChange={(selectedIds) =>
              setFormData((prev) => ({ ...prev, customTagIds: selectedIds }))
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit">Save Program</Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Program</DialogTitle>
          <DialogDescription>
            Add a new academic program to your shortlist.
          </DialogDescription>
        </DialogHeader>
        {isMobile ? (
          <ScrollArea className="h-[60vh] pr-4">{formContent}</ScrollArea>
        ) : (
          formContent
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProgramDialog;
