/**
 * Som da katana: sacar, cantar e cortar.
 *
 * A versão anterior era um oscilador dente de serra descendo de tom — soava
 * como um zumbido eletrônico. Lâmina de verdade não tem tom puro: tem atrito e
 * ressonância. Por isso aqui são três camadas, todas sintetizadas na hora com a
 * Web Audio API (sem arquivo para baixar):
 *
 *  1. Saya-biki — a lâmina raspando a bainha. Ruído branco passado por um
 *     filtro de banda estreita cuja frequência sobe enquanto a espada sai: é o
 *     "shhhh" que vai ficando mais agudo.
 *  2. Ressonância — o "iiing" do aço livre. Parciais inarmônicos (proporções de
 *     placa metálica, não de corda), cada um em dupla levemente desafinada
 *     para dar o batimento que faz o metal "cantar", com cauda longa.
 *  3. Corte — um "vush" grave e rápido, disparado quando a lâmina risca a tela.
 *
 * O contexto de áudio é criado uma vez e reaproveitado: criar um por clique
 * acumula instâncias e atrasa o primeiro som.
 */

let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (contexto) return contexto;

  const Construtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Construtor) return null;

  try {
    contexto = new Construtor();
  } catch {
    return null;
  }
  return contexto;
}

/** Ruído branco reaproveitável de `segundos` de duração. */
function ruido(ctx: AudioContext, segundos: number): AudioBuffer {
  const tamanho = Math.floor(ctx.sampleRate * segundos);
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < tamanho; i += 1) dados[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Cadeia final: volume geral e um compressor para os picos não estourarem. */
function saida(ctx: AudioContext, volume: number): AudioNode {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.ratio.value = 4;
  const geral = ctx.createGain();
  geral.gain.value = volume;
  geral.connect(compressor).connect(ctx.destination);
  return geral;
}

/** Sacar a espada: raspagem na bainha seguida do canto do aço. */
export function tocarSaque() {
  const ctx = obterContexto();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const t = ctx.currentTime + 0.01;
  const destino = saida(ctx, 0.22);

  // 1. Raspagem — 0 a 0,3 s
  const raspa = ctx.createBufferSource();
  raspa.buffer = ruido(ctx, 0.35);

  const banda = ctx.createBiquadFilter();
  banda.type = "bandpass";
  banda.Q.value = 9;
  banda.frequency.setValueAtTime(1800, t);
  banda.frequency.exponentialRampToValueAtTime(6500, t + 0.28);

  const brilho = ctx.createBiquadFilter();
  brilho.type = "highpass";
  brilho.frequency.value = 900;

  const envRaspa = ctx.createGain();
  envRaspa.gain.setValueAtTime(0.0001, t);
  envRaspa.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
  envRaspa.gain.setValueAtTime(0.9, t + 0.22);
  envRaspa.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

  raspa.connect(banda).connect(brilho).connect(envRaspa).connect(destino);
  raspa.start(t);
  raspa.stop(t + 0.35);

  // 2. Ressonância — começa quando a ponta deixa a bainha (~0,24 s)
  const inicio = t + 0.24;
  const PARCIAIS = [
    { f: 2350, g: 0.22, cauda: 1.1 },
    { f: 3720, g: 0.16, cauda: 0.9 },
    { f: 5210, g: 0.11, cauda: 0.7 },
    { f: 6890, g: 0.07, cauda: 0.5 },
  ];

  const suave = ctx.createBiquadFilter();
  suave.type = "lowpass";
  suave.frequency.value = 9000;
  suave.connect(destino);

  for (const parcial of PARCIAIS) {
    // Dois osciladores 0,3% fora de afinação: o batimento entre eles é o
    // "tremor" que faz a lâmina soar viva em vez de apito.
    for (const desvio of [0.997, 1.003]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = parcial.f * desvio;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, inicio);
      env.gain.exponentialRampToValueAtTime(parcial.g, inicio + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, inicio + parcial.cauda);

      osc.connect(env).connect(suave);
      osc.start(inicio);
      osc.stop(inicio + parcial.cauda + 0.05);
    }
  }
}

/** O corte: um sopro rápido de ar, do grave para o médio. */
export function tocarCorte() {
  const ctx = obterContexto();
  if (!ctx) return;

  const t = ctx.currentTime + 0.005;
  const destino = saida(ctx, 0.16);

  const ar = ctx.createBufferSource();
  ar.buffer = ruido(ctx, 0.25);

  const banda = ctx.createBiquadFilter();
  banda.type = "bandpass";
  banda.Q.value = 1.4;
  banda.frequency.setValueAtTime(500, t);
  banda.frequency.exponentialRampToValueAtTime(2600, t + 0.16);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(1, t + 0.06);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

  ar.connect(banda).connect(env).connect(destino);
  ar.start(t);
  ar.stop(t + 0.25);
}
