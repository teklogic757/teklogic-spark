import {
  normalizeTrainingVideo,
  type TrainingVideoListItem,
} from '@/lib/training-videos'

export type TrainingVideo = TrainingVideoListItem

const fallbackVideoData = [
  { title: "AI 101 - Session 1: What Is AI and Why Does It Matter?", url: "https://www.youtube.com/watch?v=xnLzjUrUY-c" },
  { title: "AI 101: Understanding the Fundamentals", url: "https://www.youtube.com/watch?v=P0jqIEM-Css" },
  { title: "AI 101 in Plain English", url: "https://www.youtube.com/watch?v=IoNtBSi8VM4" },
  { title: "You're Not Behind (Yet): How to Learn AI in 29 Minutes", url: "https://www.youtube.com/watch?v=9c7zh2MkslY" },
  { title: "101 Ways To Use AI In Your Daily Life", url: "https://www.youtube.com/watch?v=zkXonmqIBFg" },
  { title: "AI 101 - Session 2: Choosing the Right AI Platform", url: "https://www.youtube.com/watch?v=3aATSKgcfDw" },
  { title: "AI Agents, Clearly Explained", url: "https://www.youtube.com/watch?v=FwOTs4UxQS4" },
  { title: "Module 11) A.I. 101: Intro to A.I.", url: "https://www.youtube.com/watch?v=woWpgYLWeDQ" },
  { title: "Simplest Explanation of How Artificial Intelligence Works (No Jargon)", url: "https://www.youtube.com/watch?v=m8o2GrbR3d8" },
  { title: "AI Course for Beginners 2026 | 10 Hours Full Artificial Intelligence", url: "https://www.youtube.com/watch?v=ZTt3oKiVq-w" },
  { title: "Artificial Intelligence Full Course 2025 | AI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=D5K8bsUQa5Y" },
  { title: "AI Course For Beginners 2026 | From Zero to Hero", url: "https://www.youtube.com/watch?v=k-7DEx3NbkE" },
  { title: "How To Use Midjourney | The ULTIMATE Beginners Guide", url: "https://www.youtube.com/watch?v=J3DWZ60ShzM" },
  { title: "AI Professional Roadmap 2026 | From Beginner to Employed", url: "https://www.youtube.com/watch?v=KUqWIUDQKQ8" },
  { title: "AI for Complete Beginners: Start Using It TODAY", url: "https://www.youtube.com/watch?v=-TjwqpPbrqw" },
  { title: "Artificial Intelligence Full Course 2026 | AI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=zHsJcA-9slA" },
  { title: "Cursor AI Tutorial for Beginners | What Is Cursor AI?", url: "https://www.youtube.com/watch?v=CJDJ4eWvGKg" },
  { title: "AI Mastery Full Course | AI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=BTTS8jKStWc" },
  { title: "AI Full Course 2025 | AI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=LGCZ-Fhm48c" },
  { title: "Deep Learning In-Depth Course 2026 | Deep Learning with Python for Beginners", url: "https://www.youtube.com/watch?v=y_rPffwe-o0" },
  { title: "AI Agents Full Course 2026 | AI Agents Tutorial for Beginners", url: "https://www.youtube.com/watch?v=yMot_Z9yjZ8" },
  { title: "Fundamentals of Artificial Intelligence (NPTEL) - Week 10 Intro", url: "https://www.youtube.com/watch?v=ZW8yZ7fB__M" },
  { title: "Python Tutorial with Gen AI for 2026 | Python for Beginners", url: "https://www.youtube.com/watch?v=n7_SsIVQRUs" },
  { title: "Generative AI Full Course 2026 | Gen AI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=ko7Tkp-fyYM" },
  { title: "AI 101: An AI Course for Beginners | Comprehensive Introduction", url: "https://www.youtube.com/watch?v=kFwzMv5XbSI" },
  { title: "Intro to Artificial Intelligence (Beginner Explainer)", url: "https://www.youtube.com/watch?v=_O_uqFI3dkA" },
  { title: "Webinar: AI 101 - From Automation to Creation", url: "https://www.youtube.com/watch?v=CXgOPqYzi5I" },
  { title: "Artificial Intelligence in 20 Minutes | Complete AI Overview for Beginners (2025)", url: "https://www.youtube.com/watch?v=6u1gSJmTVeo" },
  { title: "AI 101 with Brandon Leshchinskiy (MIT Intro Talk)", url: "https://www.youtube.com/watch?v=KsHOdr5UYZ0" },
  { title: "AI Basics Explained for Absolute Beginners", url: "https://www.youtube.com/watch?v=1FJHYqE0RDg" },
  { title: "What Is Artificial Intelligence? | AI Explained Simply", url: "https://www.youtube.com/watch?v=2ePf9rue1Ao" },
  { title: "AI vs Machine Learning vs Deep Learning (Beginner Friendly)", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
  { title: "How AI Really Works in 10 Minutes", url: "https://www.youtube.com/watch?v=JMUxmLyrhSk" },
  { title: "Generative AI Explained for Beginners", url: "https://www.youtube.com/watch?v=2IK3DFHRFfw" },
  { title: "Machine Learning for Everyone (No Math, No Code)", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg" },
  { title: "What Is a Neural Network? Simple Introduction", url: "https://www.youtube.com/watch?v=bfmFfD2RIcg" },
  { title: "What Is Machine Learning?", url: "https://www.youtube.com/watch?v=WXHM_i-fgGo" },
  { title: "Intro to Deep Learning for Beginners", url: "https://www.youtube.com/watch?v=VyWAvY2CF9c" },
  { title: "Neural Networks from Scratch (Conceptual, No Code)", url: "https://www.youtube.com/watch?v=UJwK6jAStmg" },
  { title: "Reinforcement Learning Explained Simply", url: "https://www.youtube.com/watch?v=2pWv7GOvuf0" },
  { title: "How Recommendation Systems Work (Beginner AI Guide)", url: "https://www.youtube.com/watch?v=Eeg1DEeWUjA" },
  { title: "AI in Everyday Life: Real-World Examples", url: "https://www.youtube.com/watch?v=UwsrzCVZAb8" },
] as const

export const trainingVideos: TrainingVideo[] = fallbackVideoData.map((video, index) => {
  const normalized = normalizeTrainingVideo(video)

  return {
    id: `fallback-${normalized.youtube_video_id}-${index}`,
    title: normalized.title,
    url: normalized.youtube_url,
    thumbnail: normalized.thumbnail_url,
  }
})

export function shuffleVideos(videos: TrainingVideo[]): TrainingVideo[] {
  const shuffled = [...videos]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}
