import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Button,
  Select,
  Checkbox,
  Switch,
  ColorPicker,
  Upload,
  DatePicker,
  TimePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Rate,
  message,
} from "antd";

const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;
const FormData = ({ user, onBack }) => {
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();
  // const date = dayjs(user.joining_date);
  useEffect(() => {
    fetchDepartments();
    if (user) {
      form.setFieldsValue({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        Gender: user.gender,
        mobile: user.phone,
        age: user.age,
        department: user.dept_id,
        role: user.role,
        isActive: user.is_active,
        joiningDate: user.joining_date ? dayjs(user.joining_date) : null,
        availabilityTime:
          user.availability_start && user.availability_end
            ? [
                dayjs(user.availability_start, "HH:mm:ss"),
                dayjs(user.availability_end, "HH:mm:ss"),
              ]
            : null,
        tags: user.tags ? user.tags.split(",") : [],
        resume: user.resume || null,
        rate: user.rating || 0,
        agreement: user.agreement,
        profileColor: user.profile_color,
      });
    }
  }, [user, form]);

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

  const onFinish = async (values) => {


    const formData = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone: values.mobile,
      age: values.age,
      gender: values.Gender?.toLowerCase(),
      dept_id: values.department,
      role: values.role,
      joining_date: values.joiningDate?.format("YYYY-MM-DD"),
      is_active: values.isActive || false,
      rating: values.rate || 0,
      profile_color: values.profileColor?.toHexString ? values.profileColor.toHexString() : values.profileColor,
      availability_start: values.availabilityTime?.[0]?.format("HH:mm:ss"),
      availability_end: values.availabilityTime?.[1]?.format("HH:mm:ss"),
      tags: values.tags?.join(","),
      agreement: values.agreement || false,
    };

    try {
      const url = user
        ? `http://localhost:3001/api/users/${user.id}`
        : "http://localhost:3001/api/users";
      const method = user ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        message.success(
          user ? "User updated successfully!" : "User created successfully!"
        );
        form.resetFields();
        onBack && onBack();
      } else {
        const errorData = await response.json();
        message.error(
          `${user ? "Failed to update user" : "Failed to create user"}: ${
            errorData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      message.error(
        `${user ? "Failed to update user" : "Failed to create user"}: ${
          error.message
        }`
      );
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span style={{ color: "black", fontSize: 40 }}>
          {user ? "Edit User" : "Create User"}
        </span>
        {onBack && <Button onClick={onBack}>Back to Home</Button>}
      </div>
      <div className="form" style={{ display: 'flex', justifyContent: 'center' , alignItems: 'center' , flexDirection: 'column' , backgroundColor: '#ffffff' }}>
        <Form
          form={form}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
          style={{ maxWidth: 800, width: '100%',  border: '1px solid #f0f0f0', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}
          onFinish={onFinish}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First name is required" }]}
          >
            <Input placeholder="First Name" />
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
          <Form.Item
            label="Resume"
            name="resume"
            valuePropName="fileList"
            getValueFromEvent={normFile}

          >
            <Upload
              listType="picture-card"
              accept=".pdf"
              beforeUpload={(file) => {
                if (file.type !== "application/pdf") {
                  message.error("Only PDF files are allowed");
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 5 * 1024 * 1024) {
                  message.error("PDF file must be smaller than 5MB");
                  return Upload.LIST_IGNORE;
                }
                // Open PDF preview
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, "_blank");
                return false;
              }}
            >
              <button
                style={{
                  color: "inherit",
                  cursor: "inherit",
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Profile Picture"
            name="profilePicture"
            valuePropName="fileList"
            getValueFromEvent={normFile}

          >
            <Upload
              listType="picture-card"
              accept=".png,.jpg,.jpeg"
              beforeUpload={(file) => {
                if (
                  !["image/png", "image/jpg", "image/jpeg"].includes(file.type)
                ) {
                  message.error("Only PNG, JPG, JPEG files are allowed");
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 2 * 1024 * 1024) {
                  message.error("Image file must be smaller than 2MB");
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
            >
              <button
                style={{
                  color: "inherit",
                  cursor: "inherit",
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
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
          <Form.Item label="Submit form">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default FormData;
