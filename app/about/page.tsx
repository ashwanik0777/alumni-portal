import React from 'react';

const committeeMembers = [
  { role: 'President', name: 'Sh. Avneendra Rathaur', batch: "’94", handle: '@⁨~Avi⁩' },
  { role: 'Vice President', name: 'Sh. Susheel Mathur', batch: "’00", handle: '@⁨~Susheel Mathur⁩' },
  { role: 'Secretary', name: 'Sh. Pawan Yadav', batch: "’10", handle: '@⁨~Adv.Pawan Yadav⁩' },
  { role: 'Joint Secretary (Alumni Relation)', name: 'Sh. Ashwani Dixit', batch: "’11", handle: '@⁨~Er Ashwani Dixit⁩' },
  { role: 'Joint Secretary (Student Relations)', name: 'Sh. Subhash Chandra', batch: "’99", handle: '@⁨~Subhash Chandra⁩' },
  { role: 'Joint Secretary (Industry)', name: 'Sh. Sirmit Katiyar', batch: "’98", handle: '@⁨~sirmitkatiyar 1998⁩' },
  { role: 'Treasurer', name: 'Sh. Pramod Pal', batch: "’09", handle: '@⁨~Pramod Pal🙂⁩' },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="bg-card rounded-2xl p-6 md:p-10 shadow-lg border border-border">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-secondary">
          Executive Committee
        </h1>
        
        <div className="space-y-6 text-lg text-text-primary leading-relaxed">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-2xl font-bold text-primary">
              Wait is finally over!
            </h2>
            <p className="max-w-3xl mx-auto">
              I join you all in welcoming the members of interim Executive Committee of JNV Farrukhabad. 💐 
            </p>
            <p className="text-sm md:text-base italic text-text-secondary opacity-80 max-w-2xl mx-auto">
              This committee will remain in function till the first election for office bearers are held or the 6 months from today whichever is earlier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {committeeMembers.map((member, index) => (
              <div 
                key={index} 
                className={`p-5 rounded-xl border border-border/50 hover:bg-background transition-colors duration-200 flex flex-col justify-center ${index === committeeMembers.length - 1 && committeeMembers.length % 2 !== 0 ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}`}
              >
                <div className="text-sm font-bold uppercase tracking-wider text-secondary mb-1">
                  {member.role}
                </div>
                <div className="font-semibold text-xl text-text-primary">
                  {member.name} <span className="text-text-secondary font-normal ml-1 opacity-75">({member.batch})</span>
                </div>
                {/* Visual rendering of the handle text while keeping it subtle */}
               
              </div>
            ))}
          </div>

          <div className="text-center mt-12 space-y-6">
            <p className="max-w-3xl mx-auto">
              I find it the prerogative of the committee to chose up to 5 co-opted members that they believe can assist in effective functioning.
            </p>
            
            <p className="font-bold text-3xl text-secondary animate-pulse">
              Cheers! 🥂
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
