import React, { useState } from 'react';
import { Upload, message, Button, Row, Divider, Col, Progress, Layout, Typography, Image , List} from 'antd';



import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';

import { createWorker } from 'tesseract.js';


import './App.css';

const { Dragger } = Upload;
const { Header, Content } = Layout;
const { Paragraph } = Typography;



function App() {

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing');
  const [file, setFile] = useState({});
  const [savedText, setSavedText] = useState({});
  const [text, setText] = useState('');
  const [listData,setListData] = useState([]);

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const props = {
    name: 'file',

    onChange(info) {
      if (info.file.status !== 'uploading') {
        setText('');
        const worker = createWorker({
          logger: m => {
            setStatus(m.status);
            setProgress(parseInt(m.progress * 100));
          }
        });

        (async () => {
          await worker.load();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          const { data: { text } } = await worker.recognize(info.file.originFileObj);
          setText(text);
          await worker.terminate();
        })();
      }
      if (info.file.status === 'done') {
        setFile(info.file);
        message.success(`${info.file.name} file uploaded successfully`);

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const discard = () => {
    setText('');
    setFile({});
  }
  const fileToDataUri = async (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result)
    };
    reader.readAsDataURL(file);
  })

  const save = async () => {

    const imgURL = await fileToDataUri(file.originFileObj);
    setSavedText((previous) => {
      previous[file.uid] = {
        id:file.uid,
        fileName: file.name,
        image: imgURL,
        text: text
      }
      return previous;
    });

    setListData(Object.values(savedText));
    setText('');
    setFile({});
  }
  const setEditedText = (id,editedText) => {
    setSavedText((previous) => {
      previous[id].text = editedText;
      return previous;
    });
    setListData(Object.values(savedText));
  }

  const deleteSavedText = (id) => {
    console.log("In Delete");
    setSavedText((previous) => {
      delete previous[id];
      return previous;
    });
    setListData(Object.values(savedText));
  }
  return (
    <>

      <Header>
        <h2 style={{ color: 'white' }}>Optical Character Recognition</h2>
      </Header>
      <br />
      <Content style={{padding:'20px'}}>
        <Dragger {...props} customRequest={dummyRequest} showUploadList={false}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
            band files
      </p>
        </Dragger>

        <br />


        {text && <Divider orientation="left">Recognised Text</Divider>}
        <Row justify="center">
          <Col span={22}>
            {progress !== 100 && progress !== 0 ?
              <>
                {status}
                <Progress percent={progress} size="small" status="active" />
              </> :
              text && <>
                <Paragraph copyable>{text}</Paragraph>
                <Button type="primary" onClick={save}>Save</Button> &nbsp;
                <Button danger onClick={discard}>Discard</Button>
              </>}
          </Col>
        </Row>
        {listData.length !== 0 && <>
          <Divider orientation="left">Saved Text(s)</Divider>
          <div style={{ padding: '10px' }}>
            <List
              itemLayout="vertical"
              size="large"
              pagination={{
                onChange: page => {
                  //console.log(page);
                },
                pageSize: 3,
              }}
              dataSource={listData}
              
              renderItem={item => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button danger icon={<DeleteOutlined />} key="delete" onClick={() => deleteSavedText(item.id)}>Delete</Button>
                  ]}
                  extra={
                    <Image
                      width={272}
                      alt={item.fileName}
                      src={item.image}
                    />
                  }
                >
                  <List.Item.Meta
                   
                    title={item.fileName}
                    description="Translated Content"
                  />
                  <Paragraph copyable editable= {{
                    onChange: (editedText) => setEditedText(item.id,editedText)
                  }}>{item.text}</Paragraph>
                </List.Item>
              )}
            />
          </div>
        </>}

      </Content>
    </>
  );

}

export default App;
