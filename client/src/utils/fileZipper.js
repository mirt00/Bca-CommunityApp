/**
 * fileZipper — utility for bundling multiple files into a zip archive
 * before uploading to the group repository.
 *
 * TODO: install a zip library compatible with React Native / Expo.
 *       Options:
 *         - expo-file-system + a JS zip library (e.g. jszip)
 *         - react-native-zip-archive (requires bare workflow or dev client)
 */

/**
 * Zip an array of file URIs into a single archive.
 *
 * @param {string[]} fileUris - Array of local file URIs (from expo-document-picker or expo-image-picker)
 * @param {string} [outputName] - Optional name for the output zip file
 * @returns {Promise<string>} URI of the created zip file
 *
 * @example
 *   const zipUri = await zipFiles(['file:///path/to/a.pdf', 'file:///path/to/b.docx']);
 */
export async function zipFiles(fileUris, outputName = 'archive.zip') {
  // TODO: implement zip logic using jszip + expo-file-system
  // Example with jszip:
  //
  // import JSZip from 'jszip';
  // import * as FileSystem from 'expo-file-system';
  //
  // const zip = new JSZip();
  // for (const uri of fileUris) {
  //   const filename = uri.split('/').pop();
  //   const content = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  //   zip.file(filename, content, { base64: true });
  // }
  // const zipBase64 = await zip.generateAsync({ type: 'base64' });
  // const outputUri = FileSystem.cacheDirectory + outputName;
  // await FileSystem.writeAsStringAsync(outputUri, zipBase64, { encoding: 'base64' });
  // return outputUri;

  throw new Error('zipFiles is not yet implemented. See TODO in fileZipper.js');
}
