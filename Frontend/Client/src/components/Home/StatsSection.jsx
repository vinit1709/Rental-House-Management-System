export default function StatsSection() {
    const stats = [
        { label: "Active Listings", value: "2,500+" },
        { label: "Verified Landlords", value: "800+" },
        { label: "Monthly Users", value: "15k" },
    ];

    return (
        <section className="bg-blue-900 py-16 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-blue-800">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="p-4">
                            <h3 className="text-5xl font-bold mb-2 text-blue-200">{stat.value}</h3>
                            <p className="text-blue-100 uppercase tracking-wider text-sm font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}