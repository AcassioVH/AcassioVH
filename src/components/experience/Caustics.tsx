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
 * Só `transform` e `opacity` são animados, então o compositor resolve na GPU. Sob
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
      {/* A respiração: a luz que atravessa a ondulação não tem brilho constante.
          Sem ela, as bandas só deslizam de lado e o olho lê esteira, não água. */}
      <div className={still ? "" : "animate-swell"} style={{ position: "absolute", inset: 0 }}>
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
    </div>
  );
}

/**
 * Feixes de luz descendo, inclinados como a haste da marca.
 *
 * Irregulares de propósito, em largura e opacidade: luz atravessando água não é
 * periódica, e é a irregularidade que impede a composição de parecer um padrão
 * gerado por repetição.
 *
 * Cada feixe balança no seu próprio tempo — períodos primos entre si, para que o
 * conjunto nunca reencontre a mesma configuração e o loop não se deixe ver.
 */
export function LightShafts({ className = "" }: { className?: string }) {
  const still = useReducedMotion();

  const shafts = [
    { left: "12%", width: 120, height: 660, skew: -12, opacity: 0.26, sway: 19, delay: 0 },
    { left: "33%", width: 54, height: 520, skew: -8, opacity: 0.18, sway: 23, delay: -7 },
    { left: "54%", width: 190, height: 740, skew: -11, opacity: 0.5, sway: 31, delay: -3 },
    { left: "70%", width: 80, height: 580, skew: -6, opacity: 0.3, sway: 17, delay: -11 },
    { left: "86%", width: 140, height: 470, skew: -13, opacity: 0.2, sway: 27, delay: -5 },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {shafts.map((shaft, index) => (
        <div
          key={index}
          className={still ? "" : "animate-sway"}
          style={{
            position: "absolute",
            left: shaft.left,
            top: -80,
            width: shaft.width,
            height: shaft.height,
            opacity: shaft.opacity,
            ["--shaft-skew" as string]: `${shaft.skew}deg`,
            transform: `skewX(${shaft.skew}deg)`,
            animationDuration: `${shaft.sway}s`,
            animationDelay: `${shaft.delay}s`,
            background:
              "linear-gradient(174deg, rgba(227,188,126,.3), rgba(227,188,126,0) 72%)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Neve marinha — a partícula em suspensão.
 *
 * É o detalhe que decide se a tela lê como "fundo escuro" ou como "dentro
 * d'água". Gradiente, feixe e cáustica descrevem a **luz**; nenhum deles diz que
 * há água entre o olho e o assunto. A partícula diz — é o único elemento da
 * composição que ocupa o volume, e não o fundo.
 *
 * Três camadas, e a profundidade é a diferença entre elas: as partículas de trás
 * são menores, mais apagadas e mais lentas; as da frente são maiores, mais
 * claras e passam mais rápido. Paralaxe é isso, e é o que impede a tela de
 * parecer um papel de parede com pontinhos.
 *
 * Sobem, não descem. Detrito de verdade afunda, mas a leitura da página é uma
 * descida — partícula subindo é o que dá a sensação de que **você** está
 * afundando, que é a metáfora do site inteiro.
 *
 * Só `transform`, então o compositor resolve na GPU: nenhuma camada dispara
 * layout ou repaint, mesmo com a página inteira rolando por cima.
 */
const SNOW_LAYERS = [
  {
    size: 190,
    duration: 74,
    opacity: 0.5,
    dots:
      "radial-gradient(circle at 18% 24%, rgba(211,220,222,.5) 0 .9px, transparent 1.4px)," +
      "radial-gradient(circle at 63% 11%, rgba(211,220,222,.36) 0 .7px, transparent 1.2px)," +
      "radial-gradient(circle at 41% 68%, rgba(227,188,126,.34) 0 .8px, transparent 1.3px)," +
      "radial-gradient(circle at 86% 52%, rgba(211,220,222,.4) 0 .7px, transparent 1.2px)," +
      "radial-gradient(circle at 8% 81%, rgba(211,220,222,.3) 0 .6px, transparent 1.1px)",
  },
  {
    size: 300,
    duration: 53,
    opacity: 0.62,
    dots:
      "radial-gradient(circle at 72% 33%, rgba(227,232,233,.62) 0 1.3px, transparent 2px)," +
      "radial-gradient(circle at 27% 58%, rgba(227,188,126,.44) 0 1.1px, transparent 1.8px)," +
      "radial-gradient(circle at 54% 87%, rgba(227,232,233,.5) 0 1.2px, transparent 1.9px)," +
      "radial-gradient(circle at 91% 74%, rgba(227,232,233,.38) 0 1px, transparent 1.6px)",
  },
  {
    size: 470,
    duration: 37,
    opacity: 0.5,
    dots:
      "radial-gradient(circle at 35% 42%, rgba(240,242,241,.72) 0 1.9px, transparent 2.9px)," +
      "radial-gradient(circle at 79% 76%, rgba(227,188,126,.5) 0 1.7px, transparent 2.6px)," +
      "radial-gradient(circle at 14% 92%, rgba(240,242,241,.55) 0 1.6px, transparent 2.5px)",
  },
] as const;

export function MarineSnow({ className = "" }: { className?: string }) {
  const still = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        // A partícula some nas bordas de cima e de baixo: sem isso, ela aparece
        // e desaparece numa linha reta, e a linha entrega o efeito.
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
      }}
    >
      {SNOW_LAYERS.map((layer, index) => (
        <div
          key={index}
          className={still ? "" : "animate-rise"}
          style={{
            position: "absolute",
            inset: `-${layer.size}px 0 -${layer.size}px 0`,
            opacity: layer.opacity,
            backgroundImage: layer.dots,
            backgroundSize: `${layer.size}px ${layer.size}px`,
            ["--snow-tile" as string]: `${layer.size}px`,
            animationDuration: `${layer.duration}s`,
            animationDelay: `${-index * 11}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * A superfície, vista por baixo.
 *
 * De dentro d'água, o alto do campo de visão não é céu nem borda: é um teto
 * líquido, mais claro que tudo, ondulando. É a referência que diz ao olho de que
 * lado da água ele está — sem ela, uma tela escura com partícula pode ser
 * qualquer coisa, inclusive espaço sideral.
 *
 * As festonas vêm de uma elipse repetida no eixo x, em duas camadas de períodos
 * diferentes que deslizam em velocidades diferentes. A soma das duas nunca
 * repete o mesmo perfil, que é como uma onda de verdade se comporta: nenhuma
 * crista é igual à anterior.
 */
export function WaterSurface({ className = "" }: { className?: string }) {
  const still = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 h-[190px] overflow-hidden ${className}`}
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.4) 55%, transparent)",
        maskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.4) 55%, transparent)",
      }}
    >
      <div
        className={still ? "" : "animate-drift-slow"}
        style={{
          position: "absolute",
          inset: "0 -40%",
          backgroundImage:
            "radial-gradient(ellipse 78px 30px at 50% 0%," +
            "rgba(227,188,126,.34) 0 52%, rgba(227,188,126,0) 76%)",
          backgroundSize: "156px 100px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <div
        className={still ? "" : "animate-drift-fast"}
        style={{
          position: "absolute",
          inset: "0 -40%",
          backgroundImage:
            "radial-gradient(ellipse 124px 52px at 50% 0%," +
            "rgba(234,237,236,.2) 0 46%, rgba(234,237,236,0) 74%)",
          backgroundSize: "248px 150px",
          backgroundRepeat: "repeat-x",
        }}
      />
      {/* O fio da própria superfície: a linha mais clara da composição inteira. */}
      <div
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(240,242,241,.5) 30%," +
            "rgba(227,188,126,.7) 55%, transparent)",
          filter: "blur(.5px)",
        }}
      />
    </div>
  );
}

/**
 * A água entre o olho e o assunto.
 *
 * Duas coisas acontecem quando se olha através de muitos metros de água: o
 * contraste cai e a cor puxa para o azul. Esta camada é o segundo efeito — um
 * véu frio que se adensa para baixo, na direção em que a página avança.
 *
 * Fica **acima** do gradiente de fundo e **abaixo** do conteúdo, então o texto
 * continua com o contraste que foi medido. Velar o texto seria trocar leitura
 * por atmosfera, e a troca é ruim: o site existe para ser lido.
 */
export function WaterColumn({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          "linear-gradient(to bottom, rgba(18,51,59,0) 0%, rgba(12,37,48,.16) 42%," +
          "rgba(8,26,33,.4) 78%, rgba(4,8,9,.6) 100%)",
      }}
    />
  );
}
