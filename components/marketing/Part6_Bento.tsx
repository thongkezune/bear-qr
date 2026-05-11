"use client";

import { motion } from "framer-motion";
import { Mic, QrCode, Heart } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Mic,
    title: "Ghi lại",
    description: "Thu âm giọng nói, tải lên video hoặc viết những dòng tin nhắn chân thành từ trái tim bạn.",
    color: "primary",
  },
  {
    number: "2",
    icon: QrCode,
    title: "Gắn kết",
    description: "Ký ức được mã hóa an toàn vào một mã QR độc bản, đính kèm trên chú gấu bông Omemo sang trọng.",
    color: "secondary",
  },
  {
    number: "3",
    icon: Heart,
    title: "Sống lại",
    description: "Người nhận chỉ cần quét mã để nghe, xem và cảm nhận lại trọn vẹn khoảnh khắc bạn gửi trao.",
    color: "tertiary",
  },
];

export const Part6_Bento = () => {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-semibold tracking-widest uppercase border border-white/5">
            CÁCH HOẠT ĐỘNG
          </span>
          <h3 className="text-4xl md:text-5xl font-outfit font-medium text-on-background">
            Hành trình của cảm xúc
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="glass-panel ambient-glow rounded-xl p-8 flex flex-col items-start relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 text-surface-container-high text-8xl font-outfit font-bold opacity-20 -mr-4 -mt-4 group-hover:text-primary-container/10 transition-colors pointer-events-none">
                {step.number}
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 border transition-colors
                ${step.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' : 
                  step.color === 'secondary' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                  'bg-tertiary/10 text-tertiary border-tertiary/20'}`}
              >
                <step.icon className="w-6 h-6 fill-current" />
              </div>

              <h4 className="text-2xl font-outfit font-medium text-on-surface mb-4">
                {step.title}
              </h4>
              <p className="text-base font-be-vietnam text-on-surface-variant leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
