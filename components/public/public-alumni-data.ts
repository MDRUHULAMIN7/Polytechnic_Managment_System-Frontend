type AlumniFeatureStory = {
  type: "feature";
  category: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  imageAlt: string;
};

type AlumniQuoteStory = {
  type: "quote";
  quote: string;
  name: string;
  role: string;
};

type AlumniPortraitStory = {
  type: "portrait";
  category: string;
  title: string;
  image: string;
  imageAlt: string;
};

export const alumniHero = {
  badge: "Institutional heritage",
  title: "Legacy beyond the classroom.",
  accent: "classroom.",
  description:
    "Our alumni network represents a century of innovation, leadership, and global impact. Reconnect with the foundation of your success and help shape the future of RPI Polytechnic.",
  primaryCta: {
    label: "Join the Alumni Network",
    href: "/login",
  },
  secondaryCta: {
    label: "View Directory",
    href: "#alumni-directory",
  },
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCN1oYkPZbNf-xwaR61ZdVPedErEljc07JcmWJbkKm5R1KqWu-oeUmzBXe_NaA0H17jS7dHoFT4w28K8QCf3-WmSD7-S8XZPmiSZEd0QOHdOo9eTKNg7FdsY7Tk5gWF2_ol8JFlMjlRj_ONEbWUCxTAPddNkBtwSrVsKmVh2N9aMa2fQdO0neklAimhY0I2VYWzVnHqHP4x5sMM_03Ro1QFa67PLV_4FdEsgI52mm589vO4miiemtdxQ1augTbCPYjrPUxFNFhuSVY",
  imageAlt: "Alumni gathering at a networking event",
  backdropImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAXrsJjltZ1UuuqrVqO_qPbQr2SDYZQaBLEkK_FvBvxr2V-PmpY9H1Gfv50ipiMNA_VyjNzz6eCcorsU7rhtGKqWfHQyFBGER4x-F9UQpEEEiRHmT6J9z8Cdq5gbGsSNXGMKJPcB5HLEDVrg-hfcddjmKqtNn89j6J32bkEOA8pqTiw5k_O8fRvhHkUHgthDzXC3rZr3vUJLDcrq1q8VyClI7E05zboI3rwrvyw8Lo2KUrlDGaTSjy7507jw4Ot9DsplTsJHGVJcb4",
  backdropAlt: "Historic university campus courtyard",
  quote: {
    body: "The connections I made at RPI defined my career trajectory in Silicon Valley.",
    author: "David Chen, Class of '14",
  },
};

export const alumniStories = [
  {
    type: "feature" as const,
    category: "Executive leadership",
    name: "Sarah Jenkins",
    role: "CTO at Global Quantum Systems",
    quote: "Innovation is a collaborative effort I learned in the RPI labs.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5iUL8csU203ztaBWxHk247f7Ggy1nZEgy8mddNQYA2HiPTgvkOcOhAw4eRhIKNiVKxcAa89aDNo9-tNFEZKLV7HrriZRl28_eWM8oans0eQvPF3gKbWmCb3xsfKUa9CE7ZR7GFFMcRqsZxmYarf2m01mR7wAJghRWWiou0cDhoCwSQwGoy_w0fQq2RDh7oJHyUt-YcfCS31Z_d_pjINQi3UYBfqi5zIBjhH5AALptQUMKjTh146mK3akiA9INTQxnS_PuS7xSRlQ",
    imageAlt: "Executive alumni portrait in a modern office",
  },
  {
    type: "quote" as const,
    quote:
      "RPI did not just teach me how to build machines; it taught me how to lead the people who build them.",
    name: "Marcus Thorne",
    role: "Director of Aerospace Engineering",
  },
  {
    type: "portrait" as const,
    category: "Seminar series",
    title: "Cybersecurity in the age of quantum systems",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCctzKKIqMjqEfQFdUfDvxGHUDBuDfVKlMU4KK1RSuHf9PW4h5QsYV4Fv-G5b3jwD-vhWmeV6ds0CZ-NZAlk8PAMNrF1l32hfv0C0HB4Ix99Z4AyUQ3m1auUlwrPPktQWmFI_6eyYmGPvEG67_rubu25DPnJojRkLnQQb8lzZ6n6UyEdn6xsYS7X2alIkWYSdRAWSHgczPIdB7a_gLFOImynzRf07kJAm-4sqSCAworuXI9c8TwuXp0WLhNM1WKD8ZorjWBovhkEoc",
    imageAlt: "Scientist alumni portrait in a laboratory",
  },
  {
    type: "feature" as const,
    category: "Social enterprise",
    name: "Elena Rodriguez",
    role: "Founder of TechForEarth",
    quote: "The mission remains the same: progress for the sake of humanity.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAizSuKkMSAvHe_SWbmcQKyqB9W7AtlsectfrDOffVKiSDTZgNqYqeHwOH7WFBzBx84-67lUkwcqzTrzsuDinyivlQKlEPmuoOACCLx9kdqqOxlJfiM-VxK-Eho_u2Y4x45QSN5E9ReYwqUNFoMqj1J_MQiCbBdBc6Vyn6ep0DWBjdQ9aOfqDz3I7G-W2p4cyCzLKmjtROSBfl7DnM43ruaObVxlNDQf5ovI_eD7qKtZu4VwseCllhYAewp1e7n3SdtLsWAEVCcUms",
    imageAlt: "Entrepreneur alumni portrait in a bright studio",
  },
] satisfies readonly [
  AlumniFeatureStory,
  AlumniQuoteStory,
  AlumniPortraitStory,
  AlumniFeatureStory,
];

export const alumniMentorship = {
  badge: "Pay it forward",
  title: "Become a mentor for the next generation",
  description:
    "Your experience is a roadmap for our current students. Share your journey, provide career guidance, and help shape the next class of world-changers.",
  summary: "Join over 500 alumni mentors already making a difference.",
  images: [
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxmM3Ctwb46983m0aeVwBcamWW3b9RWZalDTJ_f9IuRj8hGgWISsXJ6aMZYFx_elr8vYdRgjP40GF0UpOih2wKnQS_pVNnT7km8cCBK_wnTQcuKGJr4hq15pSgLt2CY6CDH-OnDmIEXP1tG6Wfyvi7czWR-R22o9PYsVRgGjvqiI18vsoOndVXf2sjh9UqjyWtC5Q6R93qrz-WBjuofrkFzOfnxg5_lsHUwFvca1ya5Ac6v32M1vgQkTR-jAJ9hxrybaJcHDZvreI",
      alt: "Students collaborating with an alumni mentor around a laptop",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkG_yrSI-S9Q6OO9UyaVgkGk0mHIIQWO5yR6t21j6WJbHclMPPuuY7qlVYk4c_JDmKOIjNpDjqZp-ZAeZM3D5vqSk2mm7My-7yZ4iom-dxfnsf5t3gDG_5BTD4wsE366-AZDHgwrJpuUKp01QZBEMBq5FA9cMeB2_UBPNFjGG4Ny8lTI9X9z_x2euCZB0G_rizXQ7vxFrxUK-SNwAGvNJYnwbKfz30mNtqtCbjcnkHMXK0itz4ru7GeWufMGCYYtqZwadseccW2BU",
      alt: "Two professionals talking in a bright office lounge",
    },
  ],
  benefits: [
    {
      title: "Flexible engagement",
      description:
        "Commit to as little as one hour a month through virtual coffee chats.",
    },
    {
      title: "Resume review and guidance",
      description:
        "Help students navigate modern hiring expectations with practical advice.",
    },
    {
      title: "Career storytelling",
      description:
        "Turn lived experience into a clear path students can actually follow.",
    },
  ],
  cta: {
    label: "Register as a Mentor",
    href: "/login",
  },
};

export const alumniNetwork = {
  title: "A global network at your fingertips",
  description:
    "Access the exclusive RPI Polytechnic alumni directory. Filter by industry, location, or class year to reconnect with peers, mentors, and collaborators.",
  backgroundImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCIMvSCnMETZz5UzDpjYiC2aFRJ6a5noWgvRXbEFl3OqOYY-j8fFPrggzUeaIKYIOFbQoPJVwVZdX9toA0ndNRlplIDI9rGE_75zU1ZeplSrrQV8WwMeW-lXsMIo7CqEGvzgpjK__4PBk9Nsf6lCl3WPvTYVcLxO0QRR1ORlAdkCcG0RrapnQQILlFQA-0uOvSYQNgBwelY7P3pfZQJlc_dTr-fRbP4A6TlL9w6VJ38zTuuFB14HeXCslVtzetVklcAnceG4eJqtd0",
  backgroundAlt: "Abstract world map showing a connected alumni network",
  previewImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBxNNnayEDxobfjdF1cXqHnXpmcdvoiAN3j9My3uGYZrDVmgTzki68qrhYP8_Tfaukysw36q7opk6Ok5FxqdxtRYS3RTBVZtBJyK6KvbMn1j_vDWefdAaYEgj2mLb_qq5rAnDnigDxCovqTDep_YXjlRcem5KhcGZABLSKit0bpoQmhErIDyim1xodh7_8k8h_Hdlgvsk1ZBD1W5sTu6jFYCeASzD7RPUpiKANQ6zBjOEy4047ogpzJMdiUBXBRHpX54v1PsEAcOng",
  previewAlt: "Blurred alumni directory interface preview",
  stats: [
    { value: "12k+", label: "Active members" },
    { value: "45", label: "Countries" },
    { value: "850+", label: "Fortune 500 orgs" },
    { value: "24/7", label: "Support" },
  ],
  lockTitle: "Directory access is restricted to verified alumni",
  cta: {
    label: "Verify Alumni Status",
    href: "/login",
  },
};

export const alumniClosing = {
  title: "Your RPI journey never truly ends.",
  description:
    "Stay connected, stay informed, and continue to lead through the official alumni portal.",
  primaryCta: {
    label: "Join the Alumni Network",
    href: "/login",
  },
  secondaryCta: {
    label: "Contact Alumni Relations",
    href: "/notices",
  },
};
