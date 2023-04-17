const fs = require('fs');

async function putObject(bucket, key, data, contentType) {
  try {
    await fs.promises.access(bucket);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.promises.mkdir(bucket, { recursive: true });
    }
  }
  const filePath = `./${bucket}/${key}`;
  await fs.promises.writeFile(filePath, data);

  return {
    ContentLength: data.length,
    ContentType: contentType,
  };
}

async function getObject(bucket, key, contentType) {
  const filePath = `./${bucket}/${key}`;
  const data = await fs.promises.readFile(filePath);

  return {
    Body: data,
    ContentLength: data.length,
    ContentType: contentType,
  };
}

async function listObjects(bucket) {
  const directoryPath = `./${bucket}`;
  const filenames = await fs.promises.readdir(directoryPath);
  const objectKeys = filenames.map((filename) => ({
    Key: filename,
  }));

  return {
    Contents: objectKeys,
  };
}

async function listBuckets() {
  const bucketNames = await fs.promises.readdir('./');
  const buckets = bucketNames
    .filter((folder) => fs.statSync('./' + folder).isDirectory())
    .map((bucketName) => ({
      Name: bucketName,
      CreationDate: new Date(),
    }));

  return {
    Buckets: buckets,
  };
}

async function deleteObject(bucket, key) {
  const filePath = `./${bucket}/${key}`;
  await fs.promises.unlink(filePath);
  return {};
}

async function test() {
  const testBucket1 = 'testBucket1';
  const key1 = 'key1.txt';
  const data1 = 'Hello Everyone';
  const contentType = 'application/octet-stream';

  await putObject(testBucket1, key1, data1, contentType);
  const getResult1 = await getObject(testBucket1, key1);
  console.log('getResult1: ', getResult1.Body.toString());

  const testBucket2 = 'testBucket2';
  const key2 = 'key2.txt';
  const data2 = 'Hello JKTech';

  await putObject(testBucket2, key2, data2, contentType);
  const getResult2 = await getObject(testBucket2, key2);
  console.log('getResult2: ', getResult2.Body.toString());

  const key3 = 'key3.txt';
  const data3 = 'Hello world';

  await putObject(testBucket2, key3, data3, contentType);
  const getResult3 = await getObject(testBucket2, key3);
  console.log('getResult3: ', getResult3.Body.toString());

  const objects = await listObjects(testBucket2);
  console.log('objects', objects);
  const buckets = await listBuckets();
  console.log('buckets', buckets);

  await deleteObject(testBucket2, key2);
}

test();
