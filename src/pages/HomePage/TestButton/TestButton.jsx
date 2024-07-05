import { motion } from "framer-motion";
import "./TestButton.css";

const TestButton = () => (
  <motion.button className="treasure-button" whileHover={{ scale: 1.1 }}>
    <span className="particles"></span>
    <span className="light"></span>
    Trésor
  </motion.button>
);

export default TestButton;
