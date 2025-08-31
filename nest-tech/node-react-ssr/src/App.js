const React = require('react');
const { useState, useEffect } = React;

function App({ initialData }) {
  // 服务端渲染时，使用从服务器传递的初始数据
  // 客户端水合后，状态将接管界面更新
  const [data, setData] = useState(initialData || []);
  const [isClient, setIsClient] = useState(false);
  const [newItem, setNewItem] = useState('');

  // 这个effect只在客户端运行，证明水合成功
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 添加新项目的方法（只在客户端有效）
  const addItem = () => {
    if (newItem.trim()) {
      setData([...data, newItem]);
      setNewItem('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>React 19 服务端渲染示例</h1>
      
      {/* 显示运行环境信息 */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>页面由: {isClient ? '客户端渲染 (水合后)' : '服务端渲染'}</p>
        <p>React 版本: 19 (实验版)</p>
      </div>

      {/* 数据列表 */}
      <h2>数据列表 ({data.length} 项)</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.map((item, index) => (
          <li key={index} style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '5px' }}>
            {item}
          </li>
        ))}
      </ul>

      {/* 只有在客户端水合后才可以交互的表单 */}
      {isClient && (
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="添加新项..."
            style={{ padding: '8px', width: '70%', marginRight: '10px' }}
          />
          <button onClick={addItem} style={{ padding: '8px 16px' }}>
            添加
          </button>
        </div>
      )}
    </div>
  );
}

module.exports = App;