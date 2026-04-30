import { Link } from 'react-router-dom';
import { Target, Users, Award, Zap, Heart, TrendingUp, Globe, Star } from 'lucide-react';

const VALUES = [
  { icon: <Target size={24} />, title: 'Mission-Driven', desc: "We're committed to transforming lives through sustainable fitness practices and evidence-based coaching methods." },
  { icon: <Heart size={24} />, title: 'People First', desc: 'Every member is unique. We provide personalized guidance that adapts to individual goals, abilities, and lifestyles.' },
  { icon: <Award size={24} />, title: 'Excellence', desc: 'We maintain the highest standards in training, nutrition guidance, and community support for every member.' },
  { icon: <Zap size={24} />, title: 'Innovation', desc: 'Leveraging cutting-edge technology and science to deliver the most effective fitness solutions.' },
];

const STATS = [
  { icon: <Users size={22} />, value: '50,000+', label: 'Active Members' },
  { icon: <TrendingUp size={22} />, value: '2M+', label: 'Questions Answered' },
  { icon: <Star size={22} />, value: '150+', label: 'Expert Creators' },
  { icon: <Globe size={22} />, value: '95%', label: 'Satisfaction Rate' },
];

const TEAM = [
  { name: 'Sarah Johnson', role: 'Founder & Head Coach', desc: '15+ years experience in elite fitness coaching', img: '/website/figma/56d9e68ccff12413f144bdf75269165f5e84005a.png' },
  { name: 'Michael Chen', role: 'Nutrition Director', desc: 'Licensed dietitian and sports nutrition expert', img: '/website/figma/9bbdfb06a5eae3ca01387e38cee556cb0ba93eb3.png' },
  { name: 'Emily Rodriguez', role: 'Community Manager', desc: 'Building supportive fitness communities since 2018', img: '/website/figma/8f649ffb9509e27c1a5cfa2575f93e2a1f744127.png' },
  { name: 'David Kim', role: 'Performance Coach', desc: 'Former Olympic athlete and certified trainer', img: '/website/figma/56d9e68ccff12413f144bdf75269165f5e84005a.png' },
];

const TIMELINE = [
  { year: '2018', title: 'Founded', desc: 'Started with a vision to democratize elite fitness coaching for everyone.' },
  { year: '2019', title: '1,000 Members', desc: 'Reached our first thousand active community members.' },
  { year: '2021', title: 'App Launch', desc: 'Launched our platform with AI-powered training recommendations.' },
  { year: '2023', title: 'Global Expansion', desc: 'Extended services to 50+ countries worldwide.' },
  { year: '2026', title: '50K+ Community', desc: 'Growing community of over 50,000 active members.' },
];

export default function WebsiteAbout() {
  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4' }}>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(180deg, #1a0f0f 0%, #0a0505 100%)',
        borderRadius: '0 0 24px 24px', margin: '0 24px',
        padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 20px' }}>
            Empowering Your<br /><span style={{ color: '#ff3e48' }}>Fitness Journey</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 32px' }}>
            We believe that everyone deserves access to world-class fitness guidance. Our platform connects you with expert creators who provide personalized coaching, nutrition plans, and training programs.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/find-expert" style={{ padding: '14px 28px', borderRadius: 12, background: '#ff3e48', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Find an Expert
            </Link>
            <Link to="/create-your-ai" style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              Create Your AI
            </Link>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Our Core Values</h2>
        <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', margin: '0 0 48px' }}>The principles that guide everything we do</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48', marginBottom: 20 }}>
                {v.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR IMPACT */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: '56px 48px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Our Impact</h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', margin: '0 0 48px' }}>Numbers that reflect our commitment to your success</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48', margin: '0 auto 16px' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET OUR TEAM */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Meet Our Team</h2>
        <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', margin: '0 0 48px' }}>The experts dedicated to your success</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {TEAM.map(t => (
            <div key={t.name} style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 200, background: '#f3f0ec', overflow: 'hidden' }}>
                <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: '#ff3e48', fontWeight: 500, margin: '0 0 8px' }}>{t.role}</p>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 20, padding: '56px 48px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Our Journey</h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', margin: '0 0 48px' }}>Key milestones in our growth story</p>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {TIMELINE.map((t, i) => (
              <div key={t.year} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: i === TIMELINE.length - 1 ? '#ff3e48' : '#fff5f5',
                  color: i === TIMELINE.length - 1 ? '#fff' : '#ff3e48',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {t.year}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{t.title}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f1a 60%, #ff3e48 100%)',
          borderRadius: 24, padding: '64px 48px', textAlign: 'center', color: '#fff',
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }}>Ready to Transform Your Life?</h2>
          <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6, margin: '0 0 32px', maxWidth: 550, marginLeft: 'auto', marginRight: 'auto' }}>
            Join thousands of members who have already started their fitness journey with expert guidance.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/find-expert" style={{ padding: '14px 28px', borderRadius: 12, background: '#ff3e48', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,62,72,0.3)' }}>
              Get Started
            </Link>
            <Link to="/pricing" style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
