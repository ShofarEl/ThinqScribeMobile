import React from 'react';
import { Layout, Typography } from 'antd';
import HeaderComponent from '../components/HeaderComponent';

const { Content, } = Layout;

const Search = () => {
  return (
    <Layout className="min-h-screen bg-gray-100">
      <HeaderComponent />
      <Content className="p-8 max-w-3xl mx-auto">
        <Typography.Title level={2}>Search Results</Typography.Title>
        <Typography.Paragraph>
          Search is not implemented yet. Use the search query from URL params to fetch results.
        </Typography.Paragraph>
      </Content>
    </Layout>
  );
};

export default Search;