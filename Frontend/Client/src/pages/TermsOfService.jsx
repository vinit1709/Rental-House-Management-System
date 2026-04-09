import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="text-slate-500 font-bold hover:text-blue-600 flex items-center gap-2 mb-8 transition">
                <ArrowLeft size={18} /> Back
            </button>

            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
                    <ShieldCheck className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
                </div>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Effective Date: February 25, 2026</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
                        <p>By registering, accessing, or using this Rental House Management System ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">2. Platform Role & Limitation of Liability</h2>
                        <p>This Platform serves strictly as a technological intermediary connecting Landlords and Tenants. <strong>We do not own, manage, or act as a real estate broker for any properties listed.</strong> Any Lease Agreement generated through this Platform is a direct legal contract between the Landlord and the Tenant. We are not liable for any breaches of contract, property damage, or unpaid rent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">3. User Accounts & KYC Verification</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Users must provide accurate, current, and complete information during registration.</li>
                            <li><strong>Mandatory KYC:</strong> Landlords and Tenants must complete Identity Verification (via valid Government IDs) before listing properties or scheduling visits.</li>
                            <li>The Platform reserves the right to suspend or terminate accounts that provide fraudulent documents or engage in suspicious activities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">4. Landlord Responsibilities</h2>
                        <p>Landlords must ensure that all property listings are accurate and that they possess the legal right to rent out the property. Landlords must honor the pricing and terms presented in their listings and respond to applications and maintenance requests in a timely manner.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">5. Tenant Responsibilities</h2>
                        <p>Tenants agree to provide accurate background information when applying for properties. Upon signing a digital lease, the Tenant is legally bound to pay the agreed security deposit and monthly rent on time via the Platform's designated payment gateway.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">6. Payments & Fees</h2>
                        <p>All rent and security deposit payments are processed securely through our authorized third-party payment gateway (Razorpay). The Platform is not responsible for transaction failures caused by banking networks. Users agree not to bypass the Platform for rent payments connected to active digital leases generated here.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">7. Governing Law & Jurisdiction</h2>
                        <p>These Terms shall be governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Gujarat, India.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;