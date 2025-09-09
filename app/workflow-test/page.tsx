'use client'

import { useState, useEffect } from 'react';
import { workflowService } from '@/lib/workflowService';

export default function WorkflowTest() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const workflowsData = await workflowService.getWorkflows();
        setWorkflows(workflowsData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch workflows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">错误: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">工作流同步测试</h1>
      <p className="mb-4">从 QuantFlow 服务获取到 {workflows.length} 个工作流</p>
      
      {workflows.length > 0 ? (
        <div className="space-y-4">
          {workflows.map((workflow: any) => (
            <div key={workflow.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{workflow.name || '未命名工作流'}</h3>
              <p className="text-gray-600">ID: {workflow.id}</p>
              <p className="text-gray-600">状态: {workflow.status}</p>
              <p className="text-gray-600">创建时间: {workflow.createdAt}</p>
              <p className="text-gray-600">节点数量: {workflow.nodes}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">暂无工作流数据</div>
      )}
    </div>
  );
}

