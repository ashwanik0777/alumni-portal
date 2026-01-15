import React from 'react';
import { School, Users, Target, Award } from 'lucide-react';

const committeeMembers = [
    { role: 'President', name: 'Sh. Avneendra Rathaur', batch: "1994", },
    { role: 'Vice President', name: 'Sh. Susheel Mathur', batch: "2000", },
    { role: 'Secretary', name: 'Sh. Pawan Yadav', batch: "2010" },
    { role: 'Joint Secretary (Alumni Relation)', name: 'Sh. Ashwani Dixit', batch: "2011", },
    { role: 'Joint Secretary (Student Relations)', name: 'Sh. Subhash Chandra', batch: "1999", },
    { role: 'Joint Secretary (Industry)', name: 'Sh. Sirmit Katiyar', batch: "1998", },
    { role: 'Treasurer', name: 'Sh. Pramod Pal', batch: "2009", },
];

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <div className="bg-primary text-white py-16 md:py-24 ">
                <div className="w-full max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-block p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                        <School className="w-8 h-8 md:w-12 md:h-12 text-secondary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        About Our Community
                    </h1>
                    <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Connecting the brilliant minds of JNV Farrukhabad across the globe.
                        Celebrating our shared heritage and building a future together.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 -mt-10 relative z-10">
                {/* Mission & Vision Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Community First</h3>
                        <p className="text-text-secondary leading-relaxed">
                            Fostering a strong bond among alumni, students, and faculty through regular interactions and support networks.
                        </p>
                    </div>
                    <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Our Mission</h3>
                        <p className="text-text-secondary leading-relaxed">
                            To create a platform for professional growth, mentorship, and giving back to our alma mater.
                        </p>
                    </div>
                    <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                            <Award className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Legacy of Excellence</h3>
                        <p className="text-text-secondary leading-relaxed">
                            Celebrating the achievements of our alumni and inspiring the next generation of Navodayans.
                        </p>
                    </div>
                </div>

                {/* Executive Committee Section */}
                <div className="w-full max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Leadership</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2 mb-6">
                            Executive Committee
                        </h2>
                        <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
                    </div>

                    <div className="bg-white dark:bg-card rounded-3xl p-8 md:p-12 shadow-2xl border border-border relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="text-center space-y-6 mb-12">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary">
                                    Wait is finally over!
                                </h3>
                                <p className="text-lg text-text-primary leading-relaxed max-w-2xl mx-auto">
                                    I join you all in welcoming the members of interim Executive Committee of JNV Farrukhabad. 💐
                                </p>
                                <div className="p-4 bg-primary/5 rounded-lg inline-block">
                                    <p className="text-sm md:text-base italic text-text-secondary opacity-90">
                                        This committee will remain in function till the first election for office bearers are held or the 6 months from today whichever is earlier.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {committeeMembers.map((member, index) => (
                                    <div
                                        key={index}
                                        className={`group p-6 rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent transition-all duration-300 flex flex-col items-center text-center ${index === committeeMembers.length - 1 && committeeMembers.length % 2 !== 0 ? 'md:col-span-2 md:w-2/3 md:mx-auto' : ''}`}
                                    >
                                        <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 bg-secondary/10 px-3 py-1 rounded-full">
                                            {member.role}
                                        </div>
                                        <div className="font-bold text-xl text-text-primary mb-1 group-hover:text-primary transition-colors">
                                            {member.name}
                                        </div>
                                        <div className="text-sm font-medium text-text-secondary/80 mb-2">
                                            Batch of {member.batch}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center space-y-8 pt-8 border-t border-border/50">
                                <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                                    "I find it the prerogative of the committee to chose up to 5 co-opted members that they believe can assist in effective functioning."
                                </p>

                                <div className="animate-bounce">
                                    <p className="font-bold text-3xl md:text-4xl text-secondary inline-block transform hover:scale-110 transition-transform cursor-default">
                                        Cheers! 🥂
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
