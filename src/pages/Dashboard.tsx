import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgramContext } from "@/contexts/ProgramContext";
import { useTagContext } from "@/contexts/TagContext";
import ProgramCard from "@/components/program/ProgramCard";
import ProgramTableView from "@/components/program/ProgramTableView";
import ApplicationStatusCard from "@/components/application/ApplicationStatusCard";
import ApplicationTimeline from "@/components/application/ApplicationTimeline";
import QuickActions from "@/components/application/QuickActions";
import UpcomingDeadlines from "@/components/application/UpcomingDeadlines";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, LayoutGrid, List, Target, BarChart3, Search, TrendingUp } from "lucide-react";
import AddProgramDialog from "@/components/program/AddProgramDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { exportProgramsToCsv } from "@/utils/exportToCsv";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { programs } = useProgramContext();
  const { tags } = useTagContext();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [view, setView] = useState<"overview" | "card" | "table">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [sortOption, setSortOption] = useState<string>("createdAt");
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  // Get unique countries for filter
  const uniqueCountries = Array.from(
    new Set(programs.map((program) => program.country))
  ).sort();

  // Get status tags for filter
  const statusTags = tags.filter((tag) => tag.type === "status");

  // Get custom tags for filter
  const customTags = tags.filter((tag) => tag.type === "custom");

  // Export all programs to CSV
  const handleExportCsv = () => {
    exportProgramsToCsv(filteredPrograms);
    toast.success(`${filteredPrograms.length} programs exported to CSV`);
  };

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
          return new Date(a.deadline || "").getTime() - new Date(b.deadline || "").getTime();
        case "createdAt":
        default:
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      }
    });

  // Get application statistics
  const stats = {
    total: programs.length,
    considering: programs.filter(p => p.statusTagId === "status-considering").length,
    applied: programs.filter(p => p.statusTagId === "status-applied").length,
    accepted: programs.filter(p => p.statusTagId === "status-accepted").length,
    rejected: programs.filter(p => p.statusTagId === "status-rejected").length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your university application journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/search")} variant="outline" className="shrink-0">
            <Search className="mr-2 h-4 w-4" />
            Discover Programs
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
      </div>

      {/* Application Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Programs</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.considering}</div>
            <p className="text-xs text-muted-foreground">Researching</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.applied}</div>
            <p className="text-xs text-muted-foreground">Applied</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "overview" | "card" | "table")}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Program Cards
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />
              
              {/* Recent Applications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportCsv}
                    disabled={programs.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.slice(0, 4).map((program) => (
                      <ApplicationStatusCard
                        key={program.id}
                        program={program}
                        onViewDetails={() => setSelectedProgram(program.id)}
                      />
                    ))}
                  </div>
                  {programs.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Application Journey</h3>
                      <p className="text-gray-500 mb-6">
                        Begin by discovering programs that match your goals and interests.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => navigate("/search")}
                          className="inline-flex items-center"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Discover Programs
                        </Button>
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          variant="outline"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Known Program
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <UpcomingDeadlines />
              
              {/* Timeline for selected program */}
              {selectedProgram && (
                <ApplicationTimeline 
                  program={programs.find(p => p.id === selectedProgram)!} 
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="card" className="space-y-6">
          {/* Filters for card/table view */}
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

          {/* Filter badges and results count */}
          {filteredPrograms.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
                </p>
                {/* Filter badges */}
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
            </div>
          )}

          {/* Programs grid */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-accent/20">
              <h3 className="text-xl font-medium">No programs found</h3>
              <p className="text-muted-foreground mt-1">
                {programs.length === 0
                  ? "Start by discovering programs that match your interests"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          {/* Same filters as card view */}
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

          {/* Filter badges and results count */}
          {filteredPrograms.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
                </p>
                {/* Filter badges */}
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
            </div>
          )}

          {/* Programs table */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-accent/20">
              <h3 className="text-xl font-medium">No programs found</h3>
              <p className="text-muted-foreground mt-1">
                {programs.length === 0
                  ? "Start by discovering programs that match your interests"
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
            <ProgramTableView programs={filteredPrograms} />
          )}
        </TabsContent>
      </Tabs>

      <AddProgramDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
};

export default Dashboard;
