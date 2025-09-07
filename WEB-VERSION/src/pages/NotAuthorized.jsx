import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Link to="/">
            <Button 
              type="primary" 
              className="bg-[#E0B13A] hover:bg-[#F0C14B] border-none rounded-lg h-12 font-semibold text-lg shadow-md"
            >
              Back to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotAuthorized;