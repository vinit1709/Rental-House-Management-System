import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-blue-600 flex items-center gap-2 mb-8 transition">
                <ArrowLeft size={18} /> Back
            </button>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
                    <Lock className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
                </div>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Effective Date: February 25, 2026</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">1. Introduction</h2>
                        <p>Your privacy is our priority. This Privacy Policy outlines how we collect, use, store, and protect your personal data in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and applicable Indian data privacy regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Identity Data:</strong> Name, email address, phone number, and account passwords (encrypted).</li>
                            <li><strong>KYC Documents:</strong> Copies of Government IDs (Aadhar, PAN, etc.) required for identity verification and fraud prevention.</li>
                            <li><strong>Property Data:</strong> Addresses, exact GPS coordinates (Latitude/Longitude), property photos, and ownership documents.</li>
                            <li><strong>Financial Data:</strong> Transaction histories and payment receipts. <em>Note: We do not store full credit card numbers or UPI PINs; these are handled directly by our secure payment partner (Razorpay).</em></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">3. How We Use Your Data</h2>
                        <p>We use your data exclusively to operate the Platform. This includes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Facilitating connections between Landlords and Tenants.</li>
                            <li>Generating legally binding Digital Lease Agreements.</li>
                            <li>Processing maintenance tickets and rent payments.</li>
                            <li>Sending critical notifications regarding applications, visits, and lease expirations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">4. Data Sharing & Disclosure</h2>
                        <p>We do not sell your personal data. We only share data in the following scenarios:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Between Users:</strong> When a Tenant applies for a property, their profile is shared with the Landlord. Upon lease generation, contact details are shared between the two parties.</li>
                            <li><strong>Third-Party Service Providers:</strong> We use secure services like Cloudinary (for image hosting), Razorpay (for payments), and Email providers (for notifications).</li>
                            <li><strong>Legal Compliance:</strong> We may disclose data if required by law enforcement or court orders.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">5. Your Privacy Rights</h2>
                        <p>Under the DPDP Act, 2023, you have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Access a summary of the personal data we hold about you.</li>
                            <li>Request corrections to inaccurate data.</li>
                            <li>Request the erasure of your personal data (subject to legal retention requirements for financial and lease records).</li>
                            <li>Withdraw consent for data processing.</li>
                        </ul>
                        <p className="mt-2">To exercise these rights, please contact our Data Protection Officer through the platform's support channel.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">6. Data Security</h2>
                        <p>We implement robust security measures, including JSON Web Token (JWT) authentication, bcrypt password hashing, and secure HTTPS protocols to protect your data from unauthorized access.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;