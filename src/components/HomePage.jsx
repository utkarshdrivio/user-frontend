import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Popconfirm, message, Select, DatePicker } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const HomePage = ({ onCreateUser, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    department: '',
    status: '',
    joiningDate: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/users?page=${pagination.current}&limit=${pagination.pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        let filteredUsers = data.users;
        
        if (filters.name) {
          filteredUsers = filteredUsers.filter(user => 
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(filters.name.toLowerCase())
          );
        }
        if (filters.phone) {
          filteredUsers = filteredUsers.filter(user => 
            user.phone?.includes(filters.phone)
          );
        }
        if (filters.email) {
          filteredUsers = filteredUsers.filter(user => 
            user.email?.toLowerCase().includes(filters.email.toLowerCase())
          );
        }
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => 
            user.role?.toLowerCase().includes(filters.role.toLowerCase())
          );
        }
        if (filters.department) {
          filteredUsers = filteredUsers.filter(user => 
            user.dept_id === parseInt(filters.department)
          );
        }
        if (filters.status !== '') {
          filteredUsers = filteredUsers.filter(user => 
            user.is_active === (filters.status === 'true')
          );
        }
        if (filters.joiningDate) {
          filteredUsers = filteredUsers.filter(user => 
            user.joining_date?.includes(filters.joiningDate)
          );
        }
        
        setUsers(filteredUsers);
        setPagination((prev) => ({
          ...prev,
          total: data.totalUsers,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    fetchDepartments();
  }, []);
  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    message.success("User removed from list");
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };


  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Mobile",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Department",
      key: "department",
      render: (_, record) => record.department?.name || "N/A",
    },
    {
      title: "Joining Date",
      dataIndex: "joining_date",
      key: "joining_date",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (is_active ? "Active" : "Inactive"),
    },
    {
      title: "created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditUser(record)}
          />
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>User Data</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateUser}>
          Create New User
        </Button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Input 
          placeholder="Search Name" 
          style={{ width: 150 }} 
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <Input 
          placeholder="Search Mobile" 
          style={{ width: 150 }} 
          value={filters.phone}
          onChange={(e) => handleFilterChange('phone', e.target.value)}
        />
        <Input 
          placeholder="Search Email" 
          style={{ width: 150 }} 
          value={filters.email}
          onChange={(e) => handleFilterChange('email', e.target.value)}
        />
        <Input 
          placeholder="Search Role" 
          style={{ width: 150 }} 
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        />
        <Select 
          placeholder="Select Department" 
          style={{ width: 150 }}
          value={filters.department || undefined}
          onChange={(value) => handleFilterChange('department', value || '')}
          allowClear
        >
          {departments.map((dept) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>
        <Select 
          placeholder="Select Status" 
          style={{ width: 150 }}
          value={filters.status || undefined}
          onChange={(value) => handleFilterChange('status', value || '')}
          allowClear
        >
          <Select.Option value="true">Active</Select.Option>
          <Select.Option value="false">Inactive</Select.Option>
        </Select>
        <DatePicker 
          placeholder="Select Joining Date" 
          style={{ width: 150 }}
          onChange={(date, dateString) => handleFilterChange('joiningDate', dateString)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
          onChange: (page) =>
            setPagination((prev) => ({ ...prev, current: page })),
        }}
      />
    </div>
  );
};

export default HomePage;
