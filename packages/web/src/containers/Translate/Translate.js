import { withNamespaces } from 'react-i18next';

const Translate = ({ t, key, children }) => t(key || children);

export default withNamespaces()(Translate);
