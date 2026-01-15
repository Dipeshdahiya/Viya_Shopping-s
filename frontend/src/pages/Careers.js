import React from 'react';

const Careers = () => {
  const positions = [
    {
      title: 'Product Development Manager',
      department: 'Research & Development',
      location: 'Mumbai, India',
      type: 'Full-time'
    },
    {
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Customer Support Executive',
      department: 'Customer Service',
      location: 'Delhi, India',
      type: 'Full-time'
    },
    {
      title: 'Quality Assurance Analyst',
      department: 'Quality Control',
      location: 'Bangalore, India',
      type: 'Full-time'
    },
  ];

  const handleApply = (role) => {
    const subject = encodeURIComponent(`Application for ${role}`);
    const body = encodeURIComponent(
`Hi Veya team,

I am interested in the ${role} position.
Please find my resume attached.

Name:
Location:
LinkedIn:
Portfolio/GitHub:

Thanks!`
    );
    window.location.href = `mailto:connect.veya@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Careers at Veya</h1>
        <p className="text-purple-200 text-center mb-12">Join us in revolutionizing beauty!</p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Work With Us?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">💼</span>
                <span>Competitive salary and benefits package</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">🌱</span>
                <span>Work with a purpose-driven, sustainable brand</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">📈</span>
                <span>Opportunities for growth and career development</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">🤝</span>
                <span>Collaborative and inclusive work environment</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
            {positions.map((position, index) => (
              <div key={index} className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <button
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    onClick={() => handleApply(position.title)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Don't See a Role That Fits?</h2>
            <p className="text-gray-700 mb-4">We're always looking for talented individuals to join our team!</p>
            <button
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => handleApply('General Application')}
            >
              Send Us Your Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;



