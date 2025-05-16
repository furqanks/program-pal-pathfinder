
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import ProgramCard from "@/components/program/ProgramCard";
import ProgramTableView from "@/components/program/ProgramTableView";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddProgramDialog from "@/components/program/AddProgramDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/contexts/TagContext";

const Dashboard = () => {
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [view, setView] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [sortOption, setSortOption] = useState<string>("createdAt");

  // Get unique countries for filter
  const uniqueCountries = Array.from(
    new Set(programs.map((program) => program.country))
  ).sort();

  // Get status tags for filter
  const statusTags = tags.filter((tag) => tag.type === "status");

  // Get custom tags for filter
  const customTags = tags.filter((tag) => tag.type === "custom");

  // Filter and sort programs
  const filteredPrograms = programs
    .filter((program) => {
      // Search term filter
      if (
        searchTerm &&
        !program.programName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !program.university.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Country filter
      if (countryFilter && program.country !== countryFilter) {
        return false;
      }

      // Status tag filter
      if (statusFilter && program.statusTagId !== statusFilter) {
        return false;
      }

      // Custom tag filter
      if (tagFilter && !program.customTagIds.includes(tagFilter)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "programName":
          return a.programName.localeCompare(b.programName);
        case "university":
          return a.university.localeCompare(b.university);
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "createdAt":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Shortlist</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved programs and application progress
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search programs or universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-countries">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {statusTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-tags">All Tags</SelectItem>
              {customTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Recently Added</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="programName">Program Name</SelectItem>
              <SelectItem value="university">University</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-accent/20">
          <h3 className="text-xl font-medium">No programs found</h3>
          <p className="text-muted-foreground mt-1">
            {programs.length === 0
              ? "Start by adding programs to your shortlist"
              : "Try adjusting your filters"}
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="outline"
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
              </p>
              {countryFilter && countryFilter !== "all-countries" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Country: {countryFilter}
                  <button
                    onClick={() => setCountryFilter(undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter && statusFilter !== "all-statuses" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Status: {tags.find((t) => t.id === statusFilter)?.name}
                  <button
                    onClick={() => setStatusFilter(undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {tagFilter && tagFilter !== "all-tags" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Tag: {tags.find((t) => t.id === tagFilter)?.name}
                  <button
                    onClick={() => setTagFilter(undefined)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as "card" | "table")}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            {view === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <ProgramTableView programs={filteredPrograms} />
            )}
          </div>
        </>
      )}

      <AddProgramDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};

export default Dashboard;
