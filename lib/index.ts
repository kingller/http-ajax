import ajax from './ajax';

export * as Ajax from './interface';

export { default as AjaxBase } from './base';

export { isFormData } from './utils/form';

export { promisify } from './utils/promise';

export { getResponseData } from './utils/response-data';

export default ajax;
