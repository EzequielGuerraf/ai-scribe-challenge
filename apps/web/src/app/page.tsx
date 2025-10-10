"use client";

import { useMemo, useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/emptyState";
import { Users, Plus, Search } from "lucide-react";

type SortKey = "recent" | "az" | "za";

export default function Home() {
  const { data, isLoading } = usePatients();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  // Filter + sort patients on client for responsiveness.
  const patients = useMemo(() => {
    const base = (data ?? []).filter((p) => {
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      const full = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        full.includes(needle) ||
        p.mrn.toLowerCase().includes(needle)
      );
    });

    const sorted = [...base];
    if (sort === "recent") {
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sort === "az") {
      sorted.sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
      );
    } else if (sort === "za") {
      sorted.sort((a, b) =>
        `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`)
      );
    }
    return sorted;
  }, [data, q, sort]);

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner /> Loading patients…
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Page summary / KPI */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Users size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">Total patients</div>
                <div className="text-xl font-light text-gray-300">{data?.length ?? 0}</div>
              </div>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/notes/create")}>
              <Plus className="mr-2" size={16} />
              Create note
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardHeader title="Patients" subtitle="Search by name or MRN. Sort to quickly locate a patient." />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  placeholder="Search patients…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search patients"
                  className="pl-9"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort patients">
                <option value="recent">Sort: Recent</option>
                <option value="az">Sort: Name A → Z</option>
                <option value="za">Sort: Name Z → A</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid of patient cards */}
      {!patients.length ? (
        <EmptyState
          title={q ? "No matches for your search." : "No patients found."}
          hint={q ? "Try a different name or MRN." : "Make sure your seed ran correctly."}
          className="bg-white"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <PatientCard
              key={p.id}
              id={p.id}
              firstName={p.firstName}
              lastName={p.lastName}
              mrn={p.mrn}
              createdAt={p.createdAt}
            />
          ))}
        </div>
      )}
    </main>
  );
}

/** Presentational patient card with initials avatar and quick link. */
function PatientCard({
  id,
  firstName,
  lastName,
  mrn,
  createdAt
}: {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  createdAt: string;
}) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-emerald-800">
              {firstName} {lastName}
            </div>
            <div className="text-xs text-gray-500">MRN: {mrn}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          <a
            className="text-emerald-600 hover:text-emerald-700 font-medium"
            href={`/patients/${id}`}
            aria-label={`View notes for ${firstName} ${lastName}`}
          >
            View notes →
          </a>
        </div>
      </CardBody>
    </Card>
  );
}
