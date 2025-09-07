import React from 'react';
import { Typography, Layout, Breadcrumb, Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import './Terms.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Terms = () => {
  return (
    <Layout className="layout">
      <HeaderComponent />
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Terms of Service</Breadcrumb.Item>
        </Breadcrumb>
        
        <Card style={{ margin: '24px 0' }}>
          <Row justify="center">
            <Col xs={24} sm={22} md={20} lg={18}>
              <Title level={1}>Terms of Service</Title>
              <Paragraph>
                Last Updated: {new Date().toLocaleDateString()}
              </Paragraph>
              
              <Title level={2}>1. Introduction</Title>
              <Paragraph>
                Welcome to EDU-SAGE. These Terms of Service ("Terms") govern your use of our website, services, and applications (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
              </Paragraph>
              
              <Title level={2}>2. Definitions</Title>
              <Paragraph>
                <ul>
                  <li><Text strong>"Service"</Text> refers to the EDU-SAGE platform, website, and all related services.</li>
                  <li><Text strong>"User"</Text> refers to individuals who register for an account on our Service.</li>
                  <li><Text strong>"Writer"</Text> refers to individuals who provide academic writing services through our platform.</li>
                  <li><Text strong>"Student"</Text> refers to individuals who seek academic assistance through our platform.</li>
                  <li><Text strong>"Content"</Text> refers to text, images, videos, documents, and other materials that are uploaded, posted, or shared on our Service.</li>
                </ul>
              </Paragraph>
              
              <Title level={2}>3. User Accounts</Title>
              <Paragraph>
                <Text strong>3.1 Registration.</Text> To use certain features of our Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </Paragraph>
              <Paragraph>
                <Text strong>3.2 Account Security.</Text> You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
              </Paragraph>
              <Paragraph>
                <Text strong>3.3 Account Termination.</Text> We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
              </Paragraph>
              
              <Title level={2}>4. Acceptable Use</Title>
              <Paragraph>
                <Text strong>4.1 Compliance with Laws.</Text> You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                <ul>
                  <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
                  <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
                  <li>To impersonate or attempt to impersonate another user or any other person or entity.</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm us or users of the Service.</li>
                </ul>
              </Paragraph>
              <Paragraph>
                <Text strong>4.2 Academic Integrity.</Text> Our Service is designed to provide academic assistance and support. Users are expected to use the Service in accordance with their institution's academic integrity policies. The content provided through our Service is intended for reference and learning purposes only.
              </Paragraph>
              
              <Title level={2}>5. Intellectual Property</Title>
              <Paragraph>
                <Text strong>5.1 Our Content.</Text> The Service and its original content, features, and functionality are and will remain the exclusive property of EDU-SAGE and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
              </Paragraph>
              <Paragraph>
                <Text strong>5.2 User Content.</Text> By submitting content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your content in any existing or future media. You represent and warrant that you own or have the necessary rights to the content you submit and that the content does not violate the rights of any third party.
              </Paragraph>
              
              <Title level={2}>6. Payment Terms</Title>
              <Paragraph>
                <Text strong>6.1 Fees.</Text> Some aspects of the Service may be provided for a fee. You agree to pay all fees in accordance with the pricing and payment terms presented to you for such services.
              </Paragraph>
              <Paragraph>
                <Text strong>6.2 Billing.</Text> We use third-party payment processors to bill you through a payment account linked to your account on the Service. Payment processing services may be subject to separate terms and conditions provided by our payment processors.
              </Paragraph>
              <Paragraph>
                <Text strong>6.3 Refunds.</Text> Refunds may be issued in accordance with our Refund Policy, which is incorporated by reference into these Terms.
              </Paragraph>
              
              <Title level={2}>7. Disclaimer of Warranties</Title>
              <Paragraph>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. EDU-SAGE AND ITS AFFILIATES, SUPPLIERS, AND LICENSORS DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </Paragraph>
              
              <Title level={2}>8. Limitation of Liability</Title>
              <Paragraph>
                IN NO EVENT SHALL EDU-SAGE, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
              </Paragraph>
              
              <Title level={2}>9. Changes to Terms</Title>
              <Paragraph>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </Paragraph>
              
              <Title level={2}>10. Contact Us</Title>
              <Paragraph>
                If you have any questions about these Terms, please contact us at support@edu-sage.com.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default Terms; 