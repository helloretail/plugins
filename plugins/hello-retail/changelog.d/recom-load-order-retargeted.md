### Changed

- `recom-developer` asks for a recom's load order only when it runs the Retargeted algorithm, recommending priority 1 so it gets the visitor's retargeted products first, and warns when the page already has another Retargeted recom. Every other recom keeps its default load order.
- `recom-developer` no longer asks for each recom's heading during setup, because it cannot write that dashboard field. After creating the recoms it asks you to set each heading in the dashboard, with a suggested text.
