import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Popconfirm, message, Select, DatePicker } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { API_ENDPOINTS, buildUrl } from '../config/api';

const filterStyle = { 
  width: '100%', 
  maxWidth: 180, 
  minWidth: 140,
  borderRadius: '8px'
};

const HomePage = ({ onCreateUser, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ name: '', phone: '', email: '', role: '', department: '', status: '', joiningDate: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.current, limit: pagination.pageSize, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')) };
      const response = await fetch(buildUrl(API_ENDPOINTS.USERS.LIST, params));
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({ ...prev, total: data.totalUsers }));
      }
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
    message.success("User removed from list");
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  useEffect(() => {
    fetch(buildUrl(API_ENDPOINTS.DEPARTMENTS.LIST))
      .then(res => res.ok ? res.json() : [])
      .then(setDepartments)
      .catch(console.error);
  }, []);


  const columns = [
    { title: "Name", render: (_, record) => `${record.first_name} ${record.last_name}` },
    { title: "Mobile", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
    { title: "Department", render: (_, record) => record.department?.name || "N/A" },
    { title: "Joining Date", dataIndex: "joining_date" },
    { title: "Status", dataIndex: "is_active", render: (is_active) => is_active ? "Active" : "Inactive" },
    { title: "Created At", dataIndex: "created_at" },
    {
      title: "Actions", width: 120,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => onEditUser(record)} />
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #dee2e6',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontWeight: 'bold', fontSize: '24px' }}>User Management</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onCreateUser}
          style={{ 
            background: '#ffffff', 
            border: '2px solid #dee2e6', 
            borderRadius: '8px',
            height: '40px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#495057'
          }}
        >
          Create New User
        </Button>
      </div>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>

        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '25px', 
          marginBottom: '25px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#34495e', fontSize: '18px', fontWeight: '600' }}>Search & Filter</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['name', 'phone', 'email', 'role'].map(field => (
          <Input key={field} placeholder={`Search ${field.charAt(0).toUpperCase() + field.slice(1)}`} style={filterStyle}
            value={filters[field]} onChange={(e) => handleFilterChange(field, e.target.value)} />
        ))}
        <Select placeholder="Select Department" style={filterStyle} value={filters.department || undefined}
          onChange={(value) => handleFilterChange('department', value || '')} allowClear>
          {departments.map(dept => <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>)}
        </Select>
        <Select placeholder="Select Status" style={filterStyle} value={filters.status || undefined}
          onChange={(value) => handleFilterChange('status', value || '')} allowClear>
          <Select.Option value="true">Active</Select.Option>
          <Select.Option value="false">Inactive</Select.Option>
        </Select>
            <DatePicker placeholder="Select Joining Date" style={filterStyle}
              onChange={(date, dateString) => handleFilterChange('joiningDate', dateString)} allowClear />
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }}>
          <div style={{ background: '#ffffff', borderBottom: '2px solid #dee2e6', padding: '20px' }}>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '18px', fontWeight: '600' }}>Users List</h3>
          </div>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
            style={{ margin: 0 }}
            pagination={{
              ...pagination,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
              onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
              style: { padding: '20px' }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
