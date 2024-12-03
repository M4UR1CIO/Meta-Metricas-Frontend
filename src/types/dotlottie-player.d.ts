declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src: string;
      background?: string;
      speed?: number;
      style?: React.CSSProperties;
      loop?: boolean;
      autoplay?: boolean;
    };
  }
}
