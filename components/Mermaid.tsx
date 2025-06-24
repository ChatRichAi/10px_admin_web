import dynamic from 'next/dynamic';

const MermaidClient = dynamic(() => import('./MermaidClient'), { ssr: false });

export default MermaidClient; 