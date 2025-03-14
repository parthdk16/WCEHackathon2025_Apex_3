import { JobCard } from "./JobCards";

export default function JobDashboard() {
  const posts = [
    { title: "Frontend Developer", createdBy: "Jane Doe", createdOn: "Oct 25, 2024" },
    { title: "Backend Developer", createdBy: "John Smith", createdOn: "Oct 24, 2024" },
    { title: "Full Stack Developer", createdBy: "Alice Johnson", createdOn: "Oct 23, 2024" },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-2xl text-primary font-bold">Job Listings</h1>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
        {posts.map((job, index) => (
          <div key={index} className="flex flex-row space-x-5">
            <JobCard
              title={job.title}
              createdBy={job.createdBy}
              createdOn={job.createdOn}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
