declare module 'vivus' {
    export default class Vivus {
      static EASE: unknown;
      constructor(
        element: string | HTMLElement,
        options?: {
          type?: 'delayed' | 'sync' | 'async' | 'nsync' | 'oneByOne',
          duration?: number,
          animTimingFunction?: unknown,
          onReady?: (vivus: Vivus) => void,
        },
        callback?: (vivus: Vivus) => void
      );
  
      play(speed?: number): this;
      stop(): this;
      reset(): this;
      destroy(): this;
      finish(): this;
      setFrameProgress(progress: number): this;
      getStatus(): 'start' | 'progress' | 'end';
    }
  }
  