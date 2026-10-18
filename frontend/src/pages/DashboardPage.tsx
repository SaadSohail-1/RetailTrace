import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Layers,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    label: "Total schemas",
    value: "—",
    description: "Registered schemas",
    icon: FileText,
  },
  {
    label: "Total records",
    value: "—",
    description: "Stored records",
    icon: Database,
  },
  {
    label: "Verified records",
    value: "—",
    description: "Integrity checks",
    icon: ShieldCheck,
  },
  {
    label: "Blockchain status",
    value: "Pending",
    description: "Live status not connected",
    icon: Activity,
  },
];

const activities = [
  {
    title: "Welcome to RetailTrace",
    description: "Your business workspace is ready to set up.",
    time: "Getting started",
    icon: Layers,
  },
  {
    title: "Create your first schema",
    description: "Define the structure for the records you want to store.",
    time: "Next step",
    icon: FileText,
  },
  {
    title: "Publish a record",
    description: "Store a record and verify its blockchain integrity.",
    time: "After setup",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 text-[#263326]">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome */}
        <section>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#6A795D]">
            Overview
          </p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Business Dashboard
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68735C] sm:text-base">
                Manage your schemas, records, and blockchain verification
                from one place.
              </p>
            </div>
            <Link
              to="/schemas"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#6A795D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#56634B]"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section aria-label="Business statistics">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">At a glance</h3>
            <span className="text-xs text-[#68735C]">
              Live data not connected
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-[#D9D28B]/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D9D28B]/40 text-[#6A795D]">
                      <Icon size={22} />
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-[#8E9162]"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-[#68735C]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="mt-2 text-xs text-[#68735C]">
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Recent activity */}
          <section className="rounded-2xl border border-[#D9D28B]/70 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Recent activity</h3>
                <p className="mt-1 text-sm text-[#68735C]">
                  Your workspace activity and next steps
                </p>
              </div>
              <Activity size={21} className="text-[#6A795D]" />
            </div>

            <div className="space-y-5">
              {activities.map((activity, index) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D9D28B]/35 text-[#6A795D]">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-[#8E9162]">
                          {activity.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-[#68735C]">
                        {activity.description}
                      </p>
                    </div>

                    {index === 0 && (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-[#6A795D]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section className="rounded-2xl border border-[#D9D28B]/70 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9D28B]/40 text-[#6A795D]">
                <Zap size={21} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Quick actions</h3>
                <p className="text-sm text-[#68735C]">
                  Common tasks, one click away
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/schemas"
                className="group flex items-center justify-between rounded-xl bg-[#6A795D] p-4 text-white transition hover:bg-[#56634B]"
              >
                <div className="flex items-center gap-3">
                  <Plus size={20} />
                  <div>
                    <p className="text-sm font-semibold">Create a schema</p>
                    <p className="mt-1 text-xs text-white/80">
                      Define a record structure
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/records"
                className="group flex items-center justify-between rounded-xl bg-[#D9D28B]/40 p-4 text-[#263326] transition hover:bg-[#D9D28B]/70"
              >
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-[#6A795D]" />
                  <div>
                    <p className="text-sm font-semibold">View records</p>
                    <p className="mt-1 text-xs text-[#68735C]">
                      Browse and verify records
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <div className="flex items-start gap-3 rounded-xl border border-[#D9D28B]/70 p-4">
                <Clock3
                  size={19}
                  className="mt-0.5 shrink-0 text-[#8E9162]"
                />
                <div>
                  <p className="text-sm font-semibold">Blockchain verification</p>
                  <p className="mt-1 text-xs leading-5 text-[#68735C]">
                    Verification features will be available through the
                    Records page.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
