import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, RefreshCcw } from 'lucide-react';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "2 Meses de Garantía",
    description: "Cada dispositivo es probado a fondo y respaldado por nuestra garantía de 2 meses para tu completa tranquilidad."
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Aceptamos las principales tarjetas, Apple Pay y transferencias seguras al momento de la entrega."
  },
  {
    icon: RefreshCcw,
    title: "Devoluciones en 14 Días",
    description: "¿No estás completamente satisfecho? Devuelve tu dispositivo dentro de 14 días para un reembolso."
  }
];

export default function Trust() {
  return (
    <section className="bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {trustFeatures.map((feature, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-16 h-16 bg-apple-bg rounded-full flex items-center justify-center mb-6 text-apple-text">
                <feature.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">{feature.title}</h3>
              <p className="text-apple-gray leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
