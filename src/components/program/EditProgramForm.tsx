
import { useState, useEffect } from "react";
import { Program, useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import TagSelector from "../tags/TagSelector";

interface EditProgramFormProps {
  program: Program;
  onClose: () => void;
}

const EditProgramForm = ({ program, onClose }: EditProgramFormProps) => {
  const { updateProgram } = useProgramContext();
  const { tags } = useTagContext();
  const statusTags = tags.filter((tag) => tag.type === "status");
  const customTags = tags.filter((tag) => tag.type === "custom");

  const [formData, setFormData] = useState({
    programName: program.programName,
    university: program.university,
    degreeType: program.degreeType,
    country: program.country,
    tuition: program.tuition,
    deadline: program.deadline,
    notes: program.notes,
    statusTagId: program.statusTagId,
    customTagIds: [...program.customTagIds],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProgram(program.id, formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="programName">Program Name</Label>
          <Input
            id="programName"
            name="programName"
            value={formData.programName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="degreeType">Degree Type</Label>
          <Input
            id="degreeType"
            name="degreeType"
            value={formData.degreeType}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
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
            value={formData.deadline ? formData.deadline.substring(0, 10) : ""}
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
            rows={3}
            placeholder="Add any notes about this program..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default EditProgramForm;
