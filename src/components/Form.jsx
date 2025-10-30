import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Button, Select, Checkbox, Switch, ColorPicker, Upload, DatePicker, TimePicker, Form, Input, InputNumber, Radio, Rate, message } from "antd";
import { API_ENDPOINTS, buildUrl } from '../config/api';

const { RangePicker: TimeRangePicker } = TimePicker;

const createFileObj = (path, uid, name) => ({
  uid, name, status: 'done',
  url: `http://localhost:3001/${path.replace(/\\/g, '/')}`
});

const handleFileEvent = (e) => {
  if (Array.isArray(e)) return e;
  const fileList = e?.fileList;
  return fileList?.map(file => {
    if (file.originFileObj && !file.url) {
      file.url = URL.createObjectURL(file.originFileObj);
    }
    return file;
  }) || fileList;
};

const UserForm = ({ user, onBack }) => {
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch(buildUrl(API_ENDPOINTS.DEPARTMENTS.LIST))
      .then(res => res.ok ? res.json() : [])
      .then(setDepartments)
      .catch(console.error);

    if (user) {
      const formValues = {
        firstName: user.first_name, lastName: user.last_name, email: user.email,
        Gender: user.gender, mobile: user.phone, age: user.age,
        department: user.dept_id, role: user.role, isActive: user.is_active,
        joiningDate: user.joining_date ? dayjs(user.joining_date) : null,
        availabilityTime: user.availability_start && user.availability_end
          ? [dayjs(user.availability_start, "HH:mm:ss"), dayjs(user.availability_end, "HH:mm:ss")]
          : null,
        tags: user.tags?.split(",") || [],
        rate: user.rating || 0,
        agreement: user.agreement,
        profileColor: user.profile_color,
      };
      
      if (user.resume) formValues.resume = [createFileObj(user.resume, '-1', 'resume.pdf')];
      if (user.profile_picture) formValues.profilePicture = [createFileObj(user.profile_picture, '-2', 'profile.jpg')];
      
      form.setFieldsValue(formValues);
    }
  }, [user, form]);

  const onFinish = async (values) => {
    if (typeof window === 'undefined') return;
    
    const formData = new FormData();
    const fieldMap = {
      first_name: values.firstName, last_name: values.lastName, email: values.email,
      phone: values.mobile, age: values.age, gender: values.Gender?.toLowerCase(),
      dept_id: values.department, role: values.role,
      joining_date: values.joiningDate?.format("YYYY-MM-DD"),
      is_active: values.isActive || false, rating: values.rate || 0,
      profile_color: values.profileColor?.toHexString?.() || values.profileColor,
      availability_start: values.availabilityTime?.[0]?.format("HH:mm:ss"),
      availability_end: values.availabilityTime?.[1]?.format("HH:mm:ss"),
      tags: values.tags?.join(","), agreement: values.agreement || false
    };
    
    Object.entries(fieldMap).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    
    if (values.resume?.[0]?.originFileObj) formData.append('resume', values.resume[0].originFileObj);
    if (values.profilePicture?.[0]?.originFileObj) formData.append('profilePicture', values.profilePicture[0].originFileObj);

    try {
      const url = user ? buildUrl(API_ENDPOINTS.USERS.UPDATE(user.id)) : buildUrl(API_ENDPOINTS.USERS.CREATE);
      const response = await fetch(url, { method: user ? "PUT" : "POST", body: formData });

      if (response.ok) {
        message.success(user ? "User updated successfully!" : "User created successfully!");
        form.resetFields();
        onBack?.();
      } else {
        const errorData = await response.json();
        message.error(`${user ? "Failed to update" : "Failed to create"} user: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      message.error(`${user ? "Failed to update" : "Failed to create"} user: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '10px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '10px' }}>
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
          <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '1px solid #e9ecef', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '22px', fontWeight: '600' }}>{user ? 'Edit User' : 'Create User'}</h2>
            {onBack && <Button onClick={onBack} style={{ borderRadius: '8px', height: '38px', fontWeight: '500' }}>Back to Home</Button>}
          </div>
          <Form
            form={form}
            labelCol={{ span: 5, style: { textAlign: 'right', paddingRight: '16px' } }}
            wrapperCol={{ span: 18 }}
            layout="horizontal"
            style={{ padding: '20px', maxWidth: 'none' }}
            onFinish={onFinish}
          >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First name is required" }]}
            style={{ marginBottom: '16px' }}
          >
            <Input placeholder="First Name" style={{ borderRadius: '6px', height: '40px' }} />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Last name is required" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="Gender"
            rules={[{ required: true, message: "Gender is required" }]}
          >
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Mobile"
            name="mobile"
            rules={[
              { required: true, message: "Mobile number is required" },
              {
                pattern: /^[6-9]\d{9}$/,
                message:
                  "Mobile must be exactly 10 digits and starting with 6-9",
              },
            ]}
          >
            <Input placeholder="Enter mobile number" maxLength={10} />
          </Form.Item>
          <Form.Item
            label="Age"
            name="age"
            rules={[
              { required: true, message: "Age is required" },
              {
                type: "number",
                min: 18,
                max: 75,
                message: "Age must be between 18 and 75 years",
              },
            ]}
          >
            <InputNumber placeholder="Enter age" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Department is required" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Input placeholder="Enter your role" />
          </Form.Item>
          <Form.Item
            label="Joining Date"
            name="joiningDate"
            rules={[{ required: true, message: "Joining date is required" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item label="Profile Color" name="profileColor">
            <ColorPicker />
          </Form.Item>
          <Form.Item label="Availability Time" name="availabilityTime">
            <TimeRangePicker format="HH:mm" use12Hours />
          </Form.Item>
          <Form.Item label="Rate" name="rate">
            <Rate />
          </Form.Item>
          <Form.Item label="Is Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Files">
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <Form.Item name="resume" valuePropName="fileList" getValueFromEvent={handleFileEvent} style={{ marginBottom: 0 }}>
                  <Upload
                    listType="picture-card" accept=".pdf" beforeUpload={() => false} maxCount={1}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    onPreview={(file) => window.open(file.url || URL.createObjectURL(file.originFileObj || file), '_blank')}
                  >
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Resume</div></div>
                  </Upload>
                </Form.Item>
              </div>
              <div style={{ flex: 1 }}>
                <Form.Item name="profilePicture" valuePropName="fileList" getValueFromEvent={handleFileEvent} style={{ marginBottom: 0 }}>
                  <Upload
                    listType="picture-card" accept=".png,.jpg,.jpeg" beforeUpload={() => false} maxCount={1}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    onPreview={(file) => window.open(file.url || URL.createObjectURL(file.originFileObj || file), '_blank')}
                  >
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Profile Picture</div></div>
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select mode="tags" placeholder="Enter tags" />
          </Form.Item>
          <Form.Item
            label="Agreement"
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: "You must agree to the terms and conditions",
              },
            ]}
          >
            <Checkbox>I have read the agreement</Checkbox>
          </Form.Item>
        </Form>
        <div style={{ borderTop: '1px solid #e9ecef', padding: '10px 20px', textAlign: 'right' }}>
          <Button htmlType="submit" form={form.getFieldsValue ? undefined : 'user-form'} onClick={() => form.submit()} style={{ borderRadius: '8px', height: '38px', fontWeight: '500' }}>
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;