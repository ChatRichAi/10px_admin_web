import { useEffect, useRef, useState } from 'react';

export default function MermaidClient({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    let canceled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    const tryRender = async () => {
      if (canceled) return;
      // 必须ref.current存在且document.createElementNS可用
      if (!ref.current || typeof document.createElementNS !== 'function') {
        if (attempts < MAX_ATTEMPTS) {
          attempts += 1;
          setTimeout(tryRender, 100);
        } else {
          setError('Mermaid 渲染失败：DOM API 不可用');
        }
        return;
      }
      try {
        const mermaid = await import('mermaid');
        if (canceled) return;
        if (!mermaid?.default?.render) {
          setError('Mermaid 加载异常，未找到 mermaid.render 方法');
          return;
        }
        mermaid.default.initialize({ startOnLoad: false });
        (mermaid.default.render as any)(
          'mermaid-svg-' + Math.random(),
          chart,
          (svgCode: string) => {
            if (ref.current) ref.current.innerHTML = svgCode;
          },
          ref.current // 传递挂载节点，确保渲染上下文正确
        );
      } catch (e) {
        setError('Mermaid 加载或渲染失败: ' + String(e));
      }
    };

    tryRender();

    return () => { canceled = true; };
  }, [chart]);

  if (error) {
    return <div style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</div>;
  }

  return <div ref={ref} />;
} 