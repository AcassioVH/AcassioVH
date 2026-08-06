"use client";

import { useReducedMotion } from "motion/react";

/**
 * Cáustica: a trama que a luz desenha ao atravessar a superfície da água.
 *
 * A primeira versão deste componente errou por excesso — faixas estreitas e
 * próximas viravam uma malha densa, que lia como tela de arame e disputava
 * atenção com o título. Luz sobre água não tem período curto nem regular: são
 * poucas bandas largas, de intensidade desigual, que somem conforme descem.
 *
 * As três correções, e o motivo de cada uma:
 *
 *  - **Período longo** (~120px em vez de ~38px): banda larga lê como luz;
 *    banda estreita lê como textura.
 *  - **Máscara vertical**: a trama dissolve para baixo, como a luz que enfraquece
 *    na coluna d'água. Sem isso ela termina numa borda reta que denuncia o truque.
 *  - **Opacidade baixa**: o fundo é ambiente, não assunto.
 *
 * Só `transform` é animado, então o compositor resolve na GPU. Sob
 * `prefers-reduced-motion` tudo fica parado — e continua bonito parado, que é o
 * teste de um efeito bem escolhido.
 */
export function Caustics({ className = "" }: { className?: string }) {
  const still = useReducedMotion();

  const fade = {
    WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.55) 45%, transparent 100%)",
    maskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.55) 45%, transparent 100%)",
  } as const;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}
      style={fade}
    >
      <div
        className={still ? "" : "animate-drift-slow"}
        style={{
          position: "absolute",
          inset: "-20% -40%",
          background:
            "repeating-linear-gradient(97deg," +
            "rgba(227,188,126,.115) 0 2px," +
            "transparent 2px 26px," +
            "rgba(201,149,74,.075) 26px 30px," +
            "transparent 30px 124px)",
        }}
      />
      <div
        className={still ? "" : "animate-drift-fast"}
        style={{
          position: "absolute",
          inset: "-20% -40%",
          background:
            "repeating-linear-gradient(86deg," +
            "rgba(234,237,236,.055) 0 1px," +
            "transparent 1px 78px)",
        }}
      />
    </div>
  );
}

/**
 * Feixes de luz descendo, inclinados como a haste da marca.
 *
 * Irregulares de propósito, em largura e opacidade: luz atravessando água não é
 * periódica, e é a irregularidade que impede a composição de parecer um padrão
 * gerado por repetição.
 */
export function LightShafts({ className = "" }: { className?: string }) {
  const shafts = [
    { left: "12%", width: 120, height: 660, skew: -12, opacity: 0.26 },
    { left: "33%", width: 54, height: 520, skew: -8, opacity: 0.18 },
    { left: "54%", width: 190, height: 740, skew: -11, opacity: 0.5 },
    { left: "70%", width: 80, height: 580, skew: -6, opacity: 0.3 },
    { left: "86%", width: 140, height: 470, skew: -13, opacity: 0.2 },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {shafts.map((shaft, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: shaft.left,
            top: -80,
            width: shaft.width,
            height: shaft.height,
            opacity: shaft.opacity,
            transform: `skewX(${shaft.skew}deg)`,
            background:
              "linear-gradient(174deg, rgba(227,188,126,.3), rgba(227,188,126,0) 72%)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}
